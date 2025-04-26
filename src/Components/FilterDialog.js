import React, {useCallback, useEffect, useState, Fragment} from "react";
import {
    Dialog,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Button,
    Slide,
    Container,
    Grid2 as Grid,
    Checkbox,
    TextField,
    Autocomplete,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormGroup,
    Stack
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {DesktopDatePicker, TimePicker} from "@mui/x-date-pickers";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {renderTimeViewClock} from '@mui/x-date-pickers/timeViewRenderers';
import moment from "moment";
import {
    RESULT_GROUP_NONE,
    RESULT_GROUPS,
    RESULT_GROUP_WORKER,
    TIME_FORMAT_MONEY,
    DATE_FORMAT_DATE,
    DATE_FORMAT_MONTH,
    DATE_FORMAT,
    FILTER_FAST_DATES_TODAY,
    FILTER_FAST_DATES_LAST_7_DAYS,
    FILTER_FAST_DATES_LAST_30_DAYS,
    FILTER_FAST_DATES_LAST_90_DAYS,
    FILTER_FAST_DATES_LAST_2_DAYS,
    FILTER_FAST_DATES,
    TIME_FORMATS, TIME_FORMAT_HOURS, RESULT_GROUP_ISSUE,
} from "../constants";
import {post} from "../requests";
import GroupsDialog from "./GroupsDialog";
import {pushAnalytics, sleep, sliceIntoChunks} from "../helpers";
import SalaryDialog from "./SalaryDialog";
import {useSalaryState} from "../Context/Salary";
import {useTranslation} from "react-i18next";
import {useAtomValue} from "jotai";
import {
    groupsAtom,
    issueStatusesAtom,
    issueTypesAtom, myUserAtom,
    projectsAtom,
    queuesAtom,
    usersAtom,
} from "../jotai/atoms";
import {useFilterResult, useLoader, useMessage} from "../hooks";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function* generateMoments(start, end, step) {
    const variableMoment = start.clone();

    while (true) {
        yield variableMoment.clone();

        variableMoment.add(step);
        if (variableMoment >= end) {
            if (!variableMoment.isAfter(end)) {
                yield variableMoment.clone();
            }

            break;
        }
    }
}

function FilterDialog({handleClose, state, onApply, reload}) {
    const {t} = useTranslation();

    const {setFilteredData} = useFilterResult();
    const {startLoading, endLoading, setLoadingValue} = useLoader();
    const {showError} = useMessage();

    const users = useAtomValue(usersAtom);
    const groups = useAtomValue(groupsAtom);
    const queues = useAtomValue(queuesAtom);
    const issueStatuses = useAtomValue(issueStatusesAtom);
    const issueTypes = useAtomValue(issueTypesAtom);
    const projects = useAtomValue(projectsAtom);
    const myUser = useAtomValue(myUserAtom);

    // Специфика работы следующая, всё что происходит здесь - влияет на общий стейт только после нажатия кнопки "Применить"
    const [timeFormat, setTimeFormat] = useState(TIME_FORMAT_HOURS);
    const [dateFormat, setDateFormat] = useState(DATE_FORMAT_DATE);
    const [resultGroups, setResultGroups] = useState([RESULT_GROUP_ISSUE, RESULT_GROUP_NONE]);

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedQueues, setSelectedQueues] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [selectedIssueTypes, setSelectedIssueTypes] = useState([]);
    const [selectedIssueStatuses, setSelectedIssueStatuses] = useState([]);
    const [dateFrom, setDateFrom] = useState(moment());
    const [dateTo, setDateTo] = useState(moment());
    const [salaryDialog, setSalaryDialog] = useState(false);

    const [salaries] = useSalaryState();

    const [forceUpdate, setForceUpdate] = useState(false);

    const [highlightTime, setHighlightTime] = useState(null);

    const [groupDialogState, setGroupsDialogState] = useState(false);

    const [shouldOptimize, setShouldOptimize] = useState(false);

    const [hideDetails, setHideDetails] = useState(true);

    const [issuesMovedToStatus, setIssuesMovedToStatus] = useState(false);
    const [movedToStatusMonth, setMovedToStatusMonth] = useState(moment());

    useEffect(() => {
        if (reload) {
            handleApplyClick();
        }
    }, [reload]);

    useEffect(() => {
        const date = moment();

        date.set('hour', 0);
        date.set('minute', 0);

        if (highlightTime === null) {
            setHighlightTime(date);
        }
    }, []);

    useEffect(() => {
        if (dateFrom.isValid() && dateTo.isValid()) {
            const dates = [...generateMoments(dateFrom, dateTo, moment.duration({days: 1}))];

            setShouldOptimize(dates.length > 31);
        }
    }, [dateFrom, dateTo]);

    const prepareDates = (dates, dateFormat) => {
        const months = [
            "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
        ];

        if (dateFormat === DATE_FORMAT_MONTH) {
            const out = [];

            let month = -1;
            let index = -1;

            for (const date of dates) { // TODO: Add Year
                if (month !== date.format("MM.YYYY")) {
                    index++;
                    month = date.format("MM.YYYY");
                    out.push({
                        title: months[date.month()] + ", " + date.format("YYYY"),
                        index: date.format("MM.YYYY"),
                        grouped: true,
                        includes: []
                    });
                }

                out[index].includes.push(date);
            }

            return out;
        }

        return dates.map(date => ({
            title: date.format(DATE_FORMAT),
            index: date.format(DATE_FORMAT),
            grouped: false,
            includes: [date]
        }));
    };

    const handleApplyClick = useCallback(() => {
        const process = ({workLogs, dateFrom, dateTo}) => {
            const dates = [...generateMoments(moment(dateFrom), moment(dateTo), moment.duration({days: 1}))];

            const realDateFormat = issuesMovedToStatus ? DATE_FORMAT_MONTH : (shouldOptimize ? dateFormat : DATE_FORMAT_DATE);
            const realDates = prepareDates(dates, realDateFormat);
            const realHideDetails = shouldOptimize ? hideDetails : false;

            setFilteredData({
                timeFormat: timeFormat,
                dateFormat: realDateFormat,
                resultGroups: resultGroups,
                workLogs: workLogs,
                selectedUsers: selectedUsers.map(user => String(user)),
                dates: realDates,
                hideDetails: realHideDetails,
                highlightTime: resultGroups[0] === RESULT_GROUP_WORKER && realDateFormat !== DATE_FORMAT_MONTH ? highlightTime : false,
            });

            onApply();

            const hlTime = resultGroups[0] === RESULT_GROUP_WORKER && realDateFormat !== DATE_FORMAT_MONTH ? highlightTime.format("HH:mm") : false; // Подсветка времени имеет смысл ТОЛЬКО в том случае, если у нас первый элемент - сотрудник. Дальше могу быть любые группировки - но подсвечивать мы будем сотрудника.

            pushAnalytics('filterApplied', {
                usersFilter: selectedUsers.length > 0,
                queuesFilter: selectedQueues.length > 0,
                projectsFilter: selectedProjects.length > 0,
                issueTypesFilter: selectedIssueTypes.length > 0,

                dateFormat: realDateFormat,

                usersCount: selectedUsers.length,
                queuesCount: selectedQueues.length,
                projectsCount: selectedProjects.length,
                issueTypesCount: selectedIssueTypes.length,

                daysCount: dates.length,

                useHighlightTime: hlTime !== false,
                highlightTime: hlTime === false ? '00:00' : hlTime,

                resultGroup: resultGroups.join("-"),
                timeFormat: timeFormat
            });
        };

        if (issuesMovedToStatus) {
            startLoading();

            post("/api/v1/result_v2", {
                userIdentities: selectedUsers.map(user => String(user)),
                queues: selectedQueues,
                projects: selectedProjects,
                issueTypes: selectedIssueTypes,
                month: parseInt(movedToStatusMonth.format("MM")),
                year: parseInt(movedToStatusMonth.format("YYYY")),
                statuses: selectedIssueStatuses
            }).then(process).catch(showError).finally(() => endLoading());

            return;
        }

        if (!dateFrom.isValid() || !dateTo.isValid()) {
            return showError(t('notifications:invalid_filter_dates'));
        }

        startLoading();

        const fetchData = async filter => {
            // Оптимизация может быть здесь (!) мы можем загружать данные сразу схлопывая их (!), если у нас стоит галочка "Без деталей"
            const response = await post("/api/v1/result", filter);

            return {
                workLogs: response.workLogs,
            };
        };

        const dates = [...generateMoments(dateFrom, dateTo, moment.duration({days: 1}))];

        const fetchChunks = async chunks => {
            const out = [];

            const total = chunks.length;
            let loaded = 0;

            if (chunks.length !== 1) {
                setLoadingValue(0);
            }

            const filter = {
                userIdentities: selectedUsers.map(user => String(user)),
                queues: selectedQueues,
                projects: selectedProjects,
                issueTypes: selectedIssueTypes
            };

            const loadChunks = async chunks => {
                const failedChunks = [];

                for (const chunk of chunks) {
                    try {
                        filter.dateFrom = chunk[0].format();
                        filter.dateTo = chunk[chunk.length - 1].format();

                        const {workLogs} = await fetchData(filter);
                        loaded++;

                        if (chunks.length !== 1) {
                            setLoadingValue(parseInt(100 / (total / loaded)));
                        }

                        out.push(...workLogs);
                        await sleep(250);
                    } catch (e) {
                        failedChunks.push(chunk);
                    }
                }

                return {failedChunks};
            };

            const {failedChunks} = await loadChunks(chunks);

            if (failedChunks.length > 0) {
                await loadChunks(failedChunks);
            }

            return {
                dateFrom,
                dateTo,
                workLogs: out
            };
        };

        const chunks = sliceIntoChunks(dates, selectedUsers.length !== 0 && selectedUsers.length < 10 ? 20 : 10);

        fetchChunks(chunks).then(process).catch(showError).finally(() => endLoading());
    }, [dateFrom, dateTo, shouldOptimize, dateFormat, hideDetails, selectedProjects, selectedUsers, selectedQueues, highlightTime, timeFormat, selectedIssueTypes, movedToStatusMonth, selectedIssueStatuses, issuesMovedToStatus, resultGroups]);

    const handleGroupSelection = group => {
        setSelectedUsers(group.members.map(memberId => parseInt(memberId)));
        setGroupsDialogState(false);

        pushAnalytics('groupSelected');
    };

    const updateResultGroups = (newValue, index) => {
        setResultGroups(prev => {
            prev[index] = newValue;

            if (newValue === RESULT_GROUP_NONE) {
                // Всё что после RESULT_GROUP_NONE - режем
                prev = prev.slice(0, index + 1);
            } else {
                // Если мы поменяли что-то в середине, надо посмотреть остаток. Если там что-то есть - режем на базе него
                const before = [];

                let keyFound = false;

                for (const key in prev) {
                    if (!prev.hasOwnProperty(key)) {
                        continue;
                    }

                    if (!keyFound) {
                        before.push(prev[key]);
                    } else {
                        if (before.includes(prev[key])) {
                            prev = prev.slice(0, parseInt(key));

                            break;
                        }
                    }

                    if (parseInt(key) === index) {
                        keyFound = true;
                    }
                }
            }

            if (prev[prev.length - 1] !== RESULT_GROUP_NONE) {
                prev.push(RESULT_GROUP_NONE);
            }

            return prev;
        });

        setForceUpdate(!forceUpdate);
    };

    const handleFastDateClick = (value) => {
        if (value === FILTER_FAST_DATES_TODAY) {
            setDateFrom(moment());
        } else if (value === FILTER_FAST_DATES_LAST_2_DAYS) {
            setDateFrom(moment().subtract(1, 'days'));
        } else if (value === FILTER_FAST_DATES_LAST_7_DAYS) {
            setDateFrom(moment().subtract(6, 'days'));
        } else if (value === FILTER_FAST_DATES_LAST_30_DAYS) {
            setDateFrom(moment().subtract(29, 'days'));
        } else if (value === FILTER_FAST_DATES_LAST_90_DAYS) {
            setDateFrom(moment().subtract(89, 'days'));
        }

        pushAnalytics('fastDateClick', {
            value
        });

        setDateTo(moment());
    };

    return <Dialog
        fullScreen
        open={state}
        onClose={handleClose}
        TransitionComponent={Transition}
    >
        <GroupsDialog state={groupDialogState} handleClose={() => setGroupsDialogState(false)}
                      onSelect={group => handleGroupSelection(group)}/>
        <SalaryDialog state={salaryDialog} handleClose={() => setSalaryDialog(false)}
                      users={users} onApply={() => setSalaryDialog(false)}/>

        <AppBar sx={{position: 'relative'}}>
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={handleClose}
                    aria-label="close"
                >
                    <CloseIcon/>
                </IconButton>
                <Typography sx={{ml: 2, flex: 1}} variant="h6" component="div">
                    {t('filter:header')}
                </Typography>
                <Button color="inherit" onClick={() => handleApplyClick()}>
                    {t('common:button.apply')}
                </Button>
            </Toolbar>
        </AppBar>

        <Container component="main" sx={{mt: 2, mb: 2}} maxWidth={false}>
            <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 9}}>
                    <Autocomplete
                        multiple
                        value={users.filter(value => selectedUsers.includes(value.value))}
                        onChange={(event, newInputValue) => {
                            setSelectedUsers(newInputValue.map(user => user.value));
                        }}
                        options={users}
                        disableCloseOnSelect
                        isOptionEqualToValue={(option, value) => value && value.value === option.value}
                        getOptionLabel={option => option.label}
                        renderOption={(props, option, {selected}) => (
                            <li {...props} key={`filter-user-${option.value}`}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{marginRight: 8}}
                                    checked={selected}
                                />
                                {option.label}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField {...params} label={t('filter:users.label')}/>
                        )}
                    />
                </Grid>
                <Grid size={{xs: 12, md: 3}}>
                    {groups.length > 0 && <Button variant="outlined" size="large" fullWidth onClick={() => {
                        setGroupsDialogState(true);
                        pushAnalytics('groupsButtonClick', {groupsCount: groups.length});
                    }} sx={{mb: 1}}>
                        {t('common:button.choose_group')}
                    </Button>}
                    {!!myUser.value && <Button variant="outlined" size="large" fullWidth
                                               onClick={() => setSelectedUsers([myUser.value])}>
                        {t('common:button.choose_myself')}
                    </Button>}
                </Grid>
                <Grid size={{xs: 12}}>
                    <Autocomplete
                        multiple
                        value={queues.filter(value => selectedQueues.includes(value.value))}
                        onChange={(event, newInputValue) => {
                            setSelectedQueues(newInputValue.map(queue => queue.value));
                        }}
                        options={queues}
                        disableCloseOnSelect
                        isOptionEqualToValue={(option, value) => value && value.value === option.value}
                        getOptionLabel={option => option.label}
                        renderOption={(props, option, {selected}) => (
                            <li {...props} key={`filter-queue-${option.value}`}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{marginRight: 8}}
                                    checked={selected}
                                />
                                {option.label}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField {...params} label={t('filter:queues.label')}/>
                        )}
                    />
                </Grid>
                <Grid size={{xs: 12}}>
                    <Autocomplete
                        multiple
                        value={issueTypes.filter(value => selectedIssueTypes.includes(value.value))}
                        onChange={(event, newInputValue) => {
                            setSelectedIssueTypes(newInputValue.map(type => type.value));
                        }}
                        options={issueTypes}
                        disableCloseOnSelect
                        isOptionEqualToValue={(option, value) => value && value.value === option.value}
                        getOptionLabel={option => option.label}
                        renderOption={(props, option, {selected}) => (
                            <li {...props} key={`filter-issue-type-${option.value}`}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{marginRight: 8}}
                                    checked={selected}
                                />
                                {option.label}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField {...params} label={t('filter:issue_types.label')}/>
                        )}
                    />
                </Grid>
                <Grid size={{xs: 12, md: 9}}>
                    <Autocomplete
                        multiple
                        value={projects.filter(value => selectedProjects.includes(value.value))}
                        onChange={(event, newInputValue) => {
                            setSelectedProjects(newInputValue.map(queue => queue.value));
                        }}
                        options={projects}
                        disableCloseOnSelect
                        isOptionEqualToValue={(option, value) => value && value.value === option.value}
                        getOptionLabel={option => option.label}
                        renderOption={(props, option, {selected}) => (
                            <li {...props} key={`filter-project-${option.value}`}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{marginRight: 8}}
                                    checked={selected}
                                />
                                {option.label}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField {...params} label={t('filter:projects.label')}/>
                        )}
                    />
                </Grid>
                <Grid size={{xs: 12, md: 3}}>
                    <Button variant="outlined" size="large" fullWidth
                            onClick={() => setSelectedProjects(projects.map(p => p.value))}>
                        {t('common:button.all_projects')}
                    </Button>
                </Grid>
                <Grid size={{xs: 12}}>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox/>} label={t('filter:issues_moved_to_status.label')}
                                          checked={issuesMovedToStatus}
                                          onChange={(e) => setIssuesMovedToStatus(e.target.checked)}/>
                    </FormGroup>
                </Grid>
                {issuesMovedToStatus && <Fragment>
                    <Grid size={{xs: 12, md: 6}}>
                        <Autocomplete
                            multiple
                            value={issueStatuses.filter(value => selectedIssueStatuses.includes(value.value))}
                            onChange={(event, newInputValue) => {
                                setSelectedIssueStatuses(newInputValue.map(type => type.value));
                            }}
                            options={issueStatuses}
                            disableCloseOnSelect
                            isOptionEqualToValue={(option, value) => value && value.value === option.value}
                            getOptionLabel={option => option.label}
                            renderOption={(props, option, {selected}) => (
                                <li {...props} key={`filter-issue-status-${option.value}`}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{marginRight: 8}}
                                        checked={selected}
                                    />
                                    {option.label}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField {...params} label={t('filter:status.label')}/>
                            )}
                        />
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <FormControl fullWidth>
                            <DesktopDatePicker
                                label={t('filter:month.label')}
                                inputFormat="MM.YYYY"
                                value={movedToStatusMonth}
                                onChange={(newValue) => {
                                    setMovedToStatusMonth(newValue);
                                }}
                                disableFuture
                                views={['month', 'year']}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </FormControl>
                    </Grid>
                </Fragment>}
                {!issuesMovedToStatus && <Fragment>
                    <Grid size={{xs: 12, md: 6}}>
                        <FormControl fullWidth>
                            <DesktopDatePicker
                                label={t('filter:date_from.label')}
                                inputFormat="DD.MM.YYYY"
                                value={dateFrom}
                                onChange={(newValue) => {
                                    setDateFrom(newValue);
                                }}
                                disableFuture
                                maxDate={dateTo}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <FormControl fullWidth>
                            <DesktopDatePicker
                                label={t('filter:date_to.label')}
                                value={dateTo}
                                inputFormat="DD.MM.YYYY"
                                onChange={(newValue) => {
                                    setDateTo(newValue);
                                }}
                                disableFuture
                                minDate={dateFrom}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <Stack direction="row" spacing={2}>
                            {FILTER_FAST_DATES.map(value => <Button variant="text" key={`fast_date_${value}`}
                                                                    onClick={() => handleFastDateClick(value)}
                                                                    size="small">
                                {t(`filter:fast_date.values.${value}`)}
                            </Button>)}
                        </Stack>
                    </Grid>
                </Fragment>}
                {shouldOptimize && <Grid size={{xs: 12}}>
                    <FormControl fullWidth>
                        <FormLabel>{t('filter:date_display.label')}</FormLabel>
                        <RadioGroup row
                                    value={dateFormat}
                                    onChange={(e, newValue) => setDateFormat(newValue)}
                        >
                            <FormControlLabel value={DATE_FORMAT_DATE} control={<Radio/>}
                                              label={t(`filter:date_display.values.${DATE_FORMAT_DATE}`)}/>
                            <FormControlLabel value={DATE_FORMAT_MONTH} control={<Radio/>}
                                              label={t(`filter:date_display.values.${DATE_FORMAT_MONTH}`)}/>
                        </RadioGroup>
                    </FormControl>
                </Grid>}
                {shouldOptimize && <Grid size={{xs: 12}}>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox/>} label={t('filter:hide_details.label')}
                                          checked={hideDetails} onChange={(e) => setHideDetails(e.target.checked)}/>
                    </FormGroup>
                </Grid>}
                <Grid size={{xs: 12, md: 6}}>
                    <FormControl fullWidth>
                        <FormLabel>{t('filter:time_format.label')}</FormLabel>
                        <RadioGroup row
                                    value={timeFormat}
                                    onChange={(e, newValue) => setTimeFormat(newValue)}
                        >
                            {TIME_FORMATS.map(format => <FormControlLabel value={format} key={`time_formats-${format}`}
                                                                          control={<Radio/>}
                                                                          label={t(`filter:time_format.values.${format}`)}/>)}
                        </RadioGroup>
                    </FormControl>
                </Grid>
                {timeFormat === TIME_FORMAT_MONEY && <Grid size={{xs: 12, md: 6}}>
                    <Button fullWidth onClick={() => {
                        setSalaryDialog(true);
                        pushAnalytics('salaryButtonClick')
                    }}>{t('filter:button.salaries')}</Button>
                </Grid>}

                {RESULT_GROUPS.map((variants, index) => resultGroups[index] ?
                    <Grid size={{xs: 12}} key={`result_groups-${index}`}>
                        <FormControl>
                            <FormLabel>{t('filter:result_groups.label', {index: index + 1})}</FormLabel>
                            <RadioGroup row
                                        value={resultGroups[index]}
                                        onChange={(e, newValue) => updateResultGroups(newValue, index)}
                            >
                                {variants.map(value => (value === RESULT_GROUP_NONE || !resultGroups.slice(0, index).includes(value)) ?
                                    <FormControlLabel value={value} control={<Radio/>}
                                                      label={t(`filter:result_groups.values.${value}`)}
                                                      key={`RESULT_GROUPS-${index}-${value}`}/> : null)}
                            </RadioGroup>
                        </FormControl>
                    </Grid> : null)}
                {(resultGroups[0] === RESULT_GROUP_WORKER && (!shouldOptimize || dateFormat !== DATE_FORMAT_MONTH)) &&
                    <Grid size={{xs: 12}}>
                        <FormControl fullWidth>
                            <TimePicker
                                label={t('filter:highlight_time.label')}
                                value={highlightTime}
                                onChange={(newValue) => {
                                    setHighlightTime(newValue);
                                }}
                                viewRenderers={{
                                    hours: renderTimeViewClock,
                                    minutes: renderTimeViewClock,
                                    seconds: renderTimeViewClock,
                                }}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </FormControl>
                    </Grid>}
                <Grid size={{xs: 12, sm: 6}} offset={{sm: 3}}>
                    <Button onClick={() => handleApplyClick()} fullWidth
                            variant="outlined">{t('common:button.apply')}</Button>
                </Grid>
            </Grid>
        </Container>
    </Dialog>
}

export default FilterDialog;