import React, {useEffect, useRef, useState} from "react";
import {
    DialogTitle,
    DialogContent,
    Grid2 as Grid,
    FormControl,
    TextField,
    DialogActions,
    Button,
    Dialog,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Typography,
    Link,
    FormGroup,
    Checkbox
} from "@mui/material";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import CustomAutocomplete from "./CustomAutocomplete";
import {
    CREATE_WORK_LOG_FORM_TYPE_ADVANCED, CREATE_WORK_LOG_FORM_TYPE_BASIC,
    DATE_FORMAT, RESULT_GROUP_EPIC, RESULT_GROUP_ISSUE,
    RESULT_GROUP_WORKER,
    TASK_SEARCH_TYPE_BASE,
    TASK_SEARCH_TYPE_BOARD,
} from "../constants";
import {post, get} from "../requests";
import TaskSearchDialog from "./TaskSearchDialog";
import moment from "moment";
import {pushAnalytics, replaceRuDuration, yandexTrackerIssueUrl} from "../helpers";
import {renderTimeViewClock} from "@mui/x-date-pickers/timeViewRenderers";
import {useTranslation} from "react-i18next";
import {useAtomValue, useSetAtom} from "jotai";
import {usersAtom, boardsAtom, resultGroupsAtom, myUserAtom, selectedUsersAtom, workLogsAtom} from "../jotai/atoms";
import {useCreateWorkLogDialog, useLoader} from "../hooks";

function CreateWorkLogDialog({setData, showError, showSuccess}) {
    const {t} = useTranslation();

    const {startLoading, endLoading} = useLoader();
    const {
        close,
        isOpen,
        createdById,
        issueKey,
        issueTitle,
        duration,
        comment,
        date: rawDate
    } = useCreateWorkLogDialog();

    const users = useAtomValue(usersAtom);
    const boards = useAtomValue(boardsAtom);
    const resultGroups = useAtomValue(resultGroupsAtom);
    const myUser = useAtomValue(myUserAtom);
    const selectedUsers = useAtomValue(selectedUsersAtom);
    const setWorkLogs = useSetAtom(workLogsAtom);

    const [ userIdentity, setUserIdentity ] = useState(null);

    useEffect(() => {
        if( resultGroups.includes(RESULT_GROUP_WORKER) ) {
            if( myUser.isAdmin ) {
                if( createdById ) {
                    setUserIdentity(createdById);
                    return;
                }
            }
        }

        if( createdById ) {
            setUserIdentity(createdById);
            return;
        }

        setUserIdentity(myUser.value);
    }, [createdById, myUser, resultGroups]);

    const form = resultGroups.includes(RESULT_GROUP_ISSUE) ? CREATE_WORK_LOG_FORM_TYPE_BASIC : CREATE_WORK_LOG_FORM_TYPE_ADVANCED;
    const date = rawDate && rawDate.includes[0] ? rawDate.includes[0] : moment();

    const [taskSearchType, setTaskSearchType] = useState(TASK_SEARCH_TYPE_BASE);
    const [taskSearchDialogState, setTaskSearchDialogState] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [taskSearch, setTaskSearch] = useState("");

    const [taskBoard, setTaskBoard] = useState(0);
    const [sprints, setSprints] = useState([]);
    const [sprint, setSprint] = useState(0);

    const [newIssue, setNewIssue] = useState({key: "", title: ""});

    const taskSearchTimer = useRef(0);

    const [withComment, setWithComment] = useState(false);

    const [issuePlaceholder, setIssuePlaceholder] = useState("");
    const [issueDate, setIssueDate] = useState(date);

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        const realIssueKey = resultGroups.includes(RESULT_GROUP_ISSUE) || resultGroups.includes(RESULT_GROUP_EPIC) ? issueKey : newIssue.key;

        if (!realIssueKey) {
            return showError(t('notifications:please_choose_issue'));
        }

        const request = {
            userIdentity: String(userIdentity),
            myUser: userIdentity === myUser.value,
            issueKey: realIssueKey,
            duration: replaceRuDuration(data.get("duration")),
            comment: data.get("comment"),
            date: issueDate.format()
        };

        if (withComment) {
            const rawIssueComment = data.get("issueComment") || data.get("issueComment").trim();

            if (rawIssueComment === "") {
                request.issueComment = data.get("comment");
            } else {
                request.issueComment = rawIssueComment;
            }
        }

        if (request.duration.includes('-')) {
            return showError(t('notifications:unable_to_use_negative_time'));
        }

        startLoading();

        post("/api/v1/work_logs", request).then(response => {
            const workLog = response.data;

            if (selectedUsers.length > 0 && !selectedUsers.includes(String(workLog.createdById))) {
                showSuccess(t('notifications:work_log_created_with_restrictions'));
            } else {
                showSuccess(t('notifications:work_log_created'));
                setWorkLogs(prev => [...prev, workLog]);
            }

            close();

            pushAnalytics('workLogCreated', {
                withComment: withComment
            });
        }).catch(showError).finally(endLoading);
    };

    const handleTaskSearch = (e) => {
        const value = e.target.value.trim();

        if (value.length >= 3) {
            setTaskSearch(value);
        }
    };

    useEffect(() => {
        clearTimeout(taskSearchTimer.current);

        if (taskSearch.length >= 3) {
            taskSearchTimer.current = setTimeout(() => {
                startLoading();

                post("/api/v1/filter_tasks", {
                    query: taskSearch
                }).then(response => {
                    setTasks(response.data);
                    setTaskSearchDialogState(true);
                }).catch(showError).finally(endLoading);
            }, 350);
        }

    }, [taskSearch]);

    useEffect(() => {
        if (rawDate && rawDate.includes && rawDate.includes[0]) {
            const realDate = rawDate.includes[0];
            const nowDate = moment();

            realDate.set('hour', nowDate.hour());
            realDate.set('minute', nowDate.minute());

            setIssueDate(realDate);
        }
    }, [rawDate]);

    useEffect(() => {
        setIssuePlaceholder(comment);
    }, [isOpen]);

    const taskFilter = () => {
        const taskFilterBase = () => {
            return <Grid size={{xs: 12}}>
                <TextField label={t('components:create_work_log_dialog.fields.search.label')} variant="outlined" fullWidth onChange={e => handleTaskSearch(e)}/>
            </Grid>
        };

        const taskFilterBoards = () => {
            return <Grid size={{xs: 12}}>
                <Grid container spacing={2}>
                    <Grid size={{xs: 12}}>
                        <CustomAutocomplete
                            onChange={(e, newValue) => setTaskBoard(newValue ? newValue.value : 0)}
                            value={boards.find(u => u.value === taskBoard) || null}
                            options={boards}
                            label={t('components:create_work_log_dialog.fields.board.label')}
                        />
                    </Grid>
                    {sprints.length > 0 && <Grid size={{xs: 12}}>
                        <CustomAutocomplete
                            onChange={(e, newValue) => setSprint(newValue ? newValue.value : 0)}
                            value={sprints.find(u => u.value === sprint) || null}
                            options={sprints}
                            label={t('components:create_work_log_dialog.fields.sprint.label')}
                        />
                    </Grid>}
                </Grid>
            </Grid>
        };

        return <Grid size={{xs: 12}}>
            <Grid container spacing={2}>
                {boards.length > 0 && <Grid size={{xs: 12}}>
                    <FormControl fullWidth>
                        <FormLabel>Будем искать задачи</FormLabel>
                        <RadioGroup row
                                    value={taskSearchType}
                                    onChange={(e, newValue) => setTaskSearchType(newValue)}
                        >
                            <FormControlLabel value={TASK_SEARCH_TYPE_BASE} control={<Radio/>} label={t('components:create_work_log_dialog.fields.search_type.values.BASE')} />
                            <FormControlLabel value={TASK_SEARCH_TYPE_BOARD} control={<Radio/>} label={t('components:create_work_log_dialog.fields.search_type.values.BOARD')} />
                        </RadioGroup>
                    </FormControl>
                </Grid>}
                {taskSearchType === TASK_SEARCH_TYPE_BASE && taskFilterBase()}
                {taskSearchType === TASK_SEARCH_TYPE_BOARD && taskFilterBoards()}
                <Grid size={{xs: 12}}>
                    {newIssue.key === "" && <div>
                        {taskSearch.length <= 2 && t('notifications:minimum_search_term_is_3_symbols')}
                    </div>}
                    {newIssue.key !== "" && <div>
                        {t('components:create_work_log_dialog.selected_issue')}<br/>
                        <Link href={yandexTrackerIssueUrl(newIssue.key)} target="_blank" rel="nofollow noreferer">
                            {newIssue.title}
                        </Link>
                    </div>}
                </Grid>
            </Grid>
        </Grid>
    };

    useEffect(() => {
        if (taskBoard > 0 && sprint > 0) {
            startLoading();

            get(`/api/v1/boards/${taskBoard}/sprints/${sprint}/tasks`)
                .then(response => {
                    if (response.data.length === 0) {
                        return showError(t('notifications:issues_not_found'));
                    }

                    setTasks(response.data);
                    setTaskSearchDialogState(true);
                }).catch(showError).finally(endLoading);
        }
    }, [sprint]);

    useEffect(() => {
        if (taskBoard > 0) {
            startLoading();

            get(`/api/v1/boards/${taskBoard}/sprints`)
                .then(response => {
                    if (response.data.length === 0) {
                        showError(t('notifications:no_sprints_found_on_board'));
                    }

                    setSprints(response.data.map(sprint => ({
                        value: sprint.id,
                        label: t('components:create_work_log_dialog.sprint_name', {
                            name: sprint.attributes.name,
                            startDate: moment(sprint.attributes.startDate).format(DATE_FORMAT),
                            endDate: moment(sprint.attributes.endDate).format(DATE_FORMAT)
                        })
                    })));
                }).catch(showError).finally(endLoading);
        }
    }, [taskBoard]);

    useEffect(() => {
        if (!isOpen) {
            setNewIssue({key: "", title: ""});
            setTaskBoard(0);
            setSprints([]);
            setSprint(0);
            setTaskSearchType(TASK_SEARCH_TYPE_BASE);
        }
    }, [isOpen]);

    return <Dialog open={isOpen} onClose={() => close()} maxWidth="md" fullWidth>
        <TaskSearchDialog state={taskSearchDialogState} handleClose={() => setTaskSearchDialogState(false)}
                          tasks={tasks}
                          onSelect={task => {
                              setTaskSearchDialogState(false);
                              setNewIssue({key: task.id, title: `${task.id}: ${task.attributes.summary}`})
                          }}/>

        <form onSubmit={(e) => handleSubmit(e)}>
            <DialogTitle>{t('components:create_work_log_dialog.title')}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{paddingTop: 1}}>
                    {form !== CREATE_WORK_LOG_FORM_TYPE_ADVANCED && <Grid size={{xs: 12}}>
                        <Typography varian="h4"><Link href={yandexTrackerIssueUrl(issueKey)} target="_blank"
                                                      rel="nofollow noreferer">{issueTitle}</Link></Typography>
                    </Grid>}
                    <Grid size={{xs: 12, md: 6}}>
                        <FormControl fullWidth>
                            <DatePicker
                                disabled
                                label={t('components:create_work_log_dialog.fields.date.label')}
                                value={date}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <FormControl fullWidth>
                            <TimePicker
                                label={t('components:create_work_log_dialog.fields.time.label')}
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
                    <Grid size={{xs: 12}}>
                        <FormControl fullWidth>
                            <CustomAutocomplete
                                onChange={(e, newValue) => setUserIdentity(newValue ? newValue.value : null)}
                                disabled={resultGroups.includes(RESULT_GROUP_WORKER) || !myUser.isAdmin}
                                value={users.find(u => String(u.value) === String(userIdentity)) || null}
                                options={users}
                                label={t('components:create_work_log_dialog.fields.user.label')}
                            />
                        </FormControl>
                    </Grid>
                    {form === CREATE_WORK_LOG_FORM_TYPE_ADVANCED && taskFilter()}
                    <Grid size={{xs: 12}}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label={t('components:create_work_log_dialog.fields.duration.label')}
                            fullWidth
                            name="duration"
                            variant="standard"
                            defaultValue={duration}
                        />
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <TextField
                            label={t('components:create_work_log_dialog.fields.comment.label')}
                            multiline
                            fullWidth
                            rows={5}
                            defaultValue={comment}
                            name="comment"
                            variant="standard"
                            onChange={(e) => setIssuePlaceholder(e.target.value)}
                        />
                    </Grid>
                    {userIdentity === myUser.value && !myUser.isReadOnly && <Grid size={{xs: 12}}>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox/>} label={t('components:create_work_log_dialog.fields.with_comment.label')}
                                              checked={withComment} onChange={(e) => setWithComment(e.target.checked)}/>
                        </FormGroup>
                    </Grid>}
                    {(userIdentity === myUser.value && withComment) && <Grid size={{xs: 12}}>
                        <TextField
                            label={t('components:create_work_log_dialog.fields.issue_comment.label')}
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
                <Button onClick={() => close()} color="warning">{t('common:button.cancel')}</Button>
                <Button type="submit" color="success">{t('common:button.create')}</Button>
            </DialogActions>
        </form>
    </Dialog>
}

export default CreateWorkLogDialog;