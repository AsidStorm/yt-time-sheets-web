import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import React, {useEffect, useRef, useState} from "react";
import CustomAutocomplete from "./CustomAutocomplete";
import {
    CREATE_WORK_LOG_FORM_TYPE_ADVANCED,
    DATE_FORMAT, RESULT_GROUP_EPIC, RESULT_GROUP_ISSUE, RESULT_GROUP_ISSUE_TYPE,
    RESULT_GROUP_PROJECT,
    RESULT_GROUP_QUEUE, RESULT_GROUP_WORKER,
    TASK_SEARCH_TYPE_BASE,
    TASK_SEARCH_TYPE_BOARD,
} from "../constants";
import Typography from "@mui/material/Typography";
import {post, get} from "../requests";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import TaskSearchDialog from "./TaskSearchDialog";
import Link from "@mui/material/Link";
import moment from "moment";
import {pushAnalytics, replaceRuDuration} from "../helpers";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import {renderTimeViewClock} from "@mui/x-date-pickers/timeViewRenderers";

function CreateWorkLogDialog({ state, handleClose, data, setData, onSubmit, users, showError, admin, showSuccess, startLoading, endLoading, myUserIdentity, resultGroups, boards }) {
    const [ taskSearchType, setTaskSearchType ] = useState(TASK_SEARCH_TYPE_BASE);
    const [ taskSearchDialogState, setTaskSearchDialogState ] = useState(false);
    const [ tasks, setTasks ] = useState([]);
    const [ taskSearch, setTaskSearch ] = useState("");

    const [ taskBoard, setTaskBoard ] = useState(0);
    const [ sprints, setSprints ] = useState([]);
    const [ sprint, setSprint ] = useState(0);

    const [ newIssue, setNewIssue ] = useState({ key: "", title: "" });

    const taskSearchTimer = useRef(0);

    const [ withComment, setWithComment ] = useState(false);

    const { form, date: rawDate, duration, comment, userIdentity, issueTitle, issueKey } = data;

    const date = rawDate.includes[0];

    const [ issuePlaceholder, setIssuePlaceholder ] = useState("");
    const [ issueDate, setIssueDate ] = useState( date );

    const resultGroup = resultGroups[resultGroups.length - 2];

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        const realIssueKey = resultGroups.includes(RESULT_GROUP_ISSUE) || resultGroups.includes(RESULT_GROUP_EPIC) ? issueKey : newIssue.key;

        if( !realIssueKey ) {
            return showError("Пожалуйста, выберите задачу");
        }

        const request = {
            userIdentity: String(userIdentity),
            myUser: userIdentity === myUserIdentity,
            issueKey: realIssueKey,
            duration: replaceRuDuration(data.get("duration")),
            comment: data.get("comment"),
            date: issueDate.format()
        };

        if( withComment ) {
            const rawIssueComment = data.get("issueComment") || data.get("issueComment").trim();

            if( rawIssueComment === "" ) {
                request.issueComment = data.get("comment");
            } else {
                request.issueComment = rawIssueComment;
            }
        }

        if( request.duration.includes('-') ) {
            return showError("Нельзя указывать отрицательное время");
        }

        startLoading();

        post("/api/v1/work_logs", request).then( response => {
            onSubmit(response.data);
            pushAnalytics('workLogCreated', {
                withComment: withComment
            });
        }).catch( showError ).finally( endLoading );
    };

    const handleTaskSearch = (e) => {
        const value = e.target.value.trim();

        if( value.length >= 3 ) {
            setTaskSearch(value);
        }
    };

    useEffect(() => {
        clearTimeout(taskSearchTimer.current);

        if( taskSearch.length >= 3 ) {
            taskSearchTimer.current = setTimeout( () => {
                startLoading();

                post("/api/v1/filter_tasks", {
                    query: taskSearch
                }).then( response => {
                    setTasks(response.data);
                    setTaskSearchDialogState(true);
                }).catch( showError ).finally( endLoading );
            }, 350 );
        }

    }, [taskSearch]);

    useEffect(() => {
        if( data.date && data.date.includes && data.date.includes[0] ) {
            const realDate = data.date.includes[0];
            const nowDate = moment();

            realDate.set('hour', nowDate.hour());
            realDate.set('minute', nowDate.minute());

            setIssueDate(realDate);
        }
    }, [data]);

    useEffect(() => {
        setIssuePlaceholder(data.comment);
    }, [state]);

    const taskFilter = () => {
        const taskFilterBase = () => {
            return <Grid item xs={12}>
                <TextField label="Поиск задач" variant="outlined" fullWidth onChange={e => handleTaskSearch(e)} />
            </Grid>
        };

        const taskFilterBoards = () => {
            return <Grid item xs={12}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <CustomAutocomplete
                            onChange={(e, newValue) => setTaskBoard(newValue ? newValue.value : 0)}
                            value={boards.find(u => u.value === taskBoard) || null}
                            options={boards}
                            label="Доска"
                        />
                    </Grid>
                    {sprints.length > 0 && <Grid item xs={12}>
                        <CustomAutocomplete
                            onChange={(e, newValue) => setSprint(newValue ? newValue.value : 0)}
                            value={sprints.find(u => u.value === sprint) || null}
                            options={sprints}
                            label="Спринт"
                        />
                    </Grid>}
                </Grid>
            </Grid>
        };

        return <Grid item xs={12}>
            <Grid container spacing={2}>
                {boards.length > 0 && <Grid item xs={12}>
                    <FormControl fullWidth>
                        <FormLabel>Будем искать задачи</FormLabel>
                        <RadioGroup row
                                    value={taskSearchType}
                                    onChange={(e, newValue) => setTaskSearchType(newValue)}
                        >
                            <FormControlLabel value={TASK_SEARCH_TYPE_BASE} control={<Radio/>} label="По фильтру" />
                            <FormControlLabel value={TASK_SEARCH_TYPE_BOARD} control={<Radio/>} label="На досках" />
                        </RadioGroup>
                    </FormControl>
                </Grid>}
                {taskSearchType === TASK_SEARCH_TYPE_BASE && taskFilterBase()}
                {taskSearchType === TASK_SEARCH_TYPE_BOARD && taskFilterBoards()}
                <Grid item xs={12}>
                    {newIssue.key === "" && <div>
                        {taskSearch.length <= 2 && "Введите 3 символа для поиска задачи"}
                    </div>}
                    {newIssue.key !== "" && <div>
                        Выбрана задача:<br />
                        <Link href={`https://tracker.yandex.ru/${newIssue.key}`} target="_blank">
                            {newIssue.title}
                        </Link>
                    </div>}
                </Grid>
            </Grid>
        </Grid>
    };

    useEffect( () => {
        if( taskBoard > 0 && sprint > 0 ) {
            startLoading();

            get(`/api/v1/boards/${taskBoard}/sprints/${sprint}/tasks`)
                .then( response => {
                    if( response.data.length === 0 ) {
                        return showError("Задач не найдено");
                    }

                    setTasks(response.data);
                    setTaskSearchDialogState(true);
                }).catch( showError ).finally( endLoading );
        }
    }, [sprint]);

    useEffect( () => {
        if( taskBoard > 0 ) {
            startLoading();

            get(`/api/v1/boards/${taskBoard}/sprints`)
                .then( response => {
                    if( response.data.length === 0 ) {
                        showError("Указанная доска не содержит спринтов. Выберите другую.");
                    }

                    setSprints(response.data.map(sprint => ({
                        value: sprint.id,
                        label: `${sprint.attributes.name} (с ${moment(sprint.attributes.startDate).format(DATE_FORMAT)} по ${moment(sprint.attributes.endDate).format(DATE_FORMAT)})`
                    })))
                }).catch( showError ).finally( endLoading );
        }
    }, [taskBoard]);

    useEffect(() => {
        if( !state ) {
            setNewIssue({ key: "", title: ""});
            setTaskBoard(0);
            setSprints([]);
            setSprint(0);
            setTaskSearchType(TASK_SEARCH_TYPE_BASE);
        }
    }, [state]);

    return <Dialog open={state} onClose={() => handleClose()} maxWidth="md" fullWidth>
        <TaskSearchDialog state={taskSearchDialogState} handleClose={() => setTaskSearchDialogState(false)} tasks={tasks}
                          onSelect={task => {
                              setTaskSearchDialogState(false);
                              setNewIssue({ key: task.id, title: `${task.id}: ${task.attributes.summary}`})
                          }} />

        <form onSubmit={(e) => handleSubmit(e)}>
            <DialogTitle>Создание рабочего времени</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{paddingTop: 1}}>
                    {form !== CREATE_WORK_LOG_FORM_TYPE_ADVANCED && <Grid item xs={12}>
                        <Typography varian="h4">{issueTitle}</Typography>
                    </Grid>}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <DatePicker
                                disabled
                                label="Дата"
                                value={date}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <TimePicker
                                    label="Время"
                                    value={issueDate}
                                    viewRenderers={{
                                        hours: renderTimeViewClock,
                                        minutes: renderTimeViewClock,
                                        seconds: renderTimeViewClock,
                                    }}
                                    onChange={(newValue) => {
                                        setIssueDate(newValue);
                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <CustomAutocomplete
                                onChange={(e, newValue) => setData(prev => ({
                                    ...prev,
                                    userIdentity: newValue ? newValue.value : ""
                                }))}
                                disabled={resultGroups.includes(RESULT_GROUP_WORKER) || admin === false}
                                value={users.find(u => u.value === userIdentity) || null}
                                options={users}
                                label="Пользователь"
                            />
                        </FormControl>
                    </Grid>
                    {form === CREATE_WORK_LOG_FORM_TYPE_ADVANCED && taskFilter()}
                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Затрачено времени"
                            fullWidth
                            name="duration"
                            variant="standard"
                            defaultValue={duration}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Комментарий"
                            multiline
                            fullWidth
                            rows={5}
                            defaultValue={comment}
                            name="comment"
                            variant="standard"
                            onChange={(e) => setIssuePlaceholder(e.target.value)}
                        />
                    </Grid>
                    {userIdentity === myUserIdentity && <Grid item xs={12}>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox />} label="Добавить комментарий к задаче?" checked={withComment} onChange={(e) => setWithComment(e.target.checked)} />
                        </FormGroup>
                    </Grid>}
                    {(userIdentity === myUserIdentity && withComment) && <Grid item xs={12}>
                        <TextField
                            label="Комментарий к задаче"
                            multiline
                            fullWidth
                            rows={5}
                            placeholder={issuePlaceholder}
                            name="issueComment"
                            variant="standard"
                            focused={issuePlaceholder !== ""}
                        />
                    </Grid>}
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => handleClose()} color="warning">Отмена</Button>
                <Button type="submit" color="success">Создать</Button>
            </DialogActions>
        </form>
    </Dialog>
}

export default CreateWorkLogDialog;