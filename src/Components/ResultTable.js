import Paper from "@mui/material/Paper";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Link from "@mui/material/Link";
import ClickAwayListener from '@mui/material/ClickAwayListener';
import React, {useEffect, useRef, useState} from "react";
import TableContainer from "@mui/material/TableContainer";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import {
    CREATE_WORK_LOG_FORM_TYPE_ADVANCED,
    CREATE_WORK_LOG_FORM_TYPE_BASIC,
    DATE_FORMAT, DATE_FORMAT_DATE, DATE_FORMAT_MONTH, DEPTH_COLORS,
    EXPORT_VARIANT_AS_IS,
    EXPORT_VARIANT_ONE_ROW,
    EXPORT_VARIANT_ONE_ROW_WITH_DATE, EXPORT_VARIANT_SHORT,
    RESULT_GROUP_EPIC,
    RESULT_GROUP_ISSUE, RESULT_GROUP_ISSUE_TYPE,
    RESULT_GROUP_NONE,
    RESULT_GROUP_PROJECT,
    RESULT_GROUP_QUEUE,
    RESULT_GROUP_WORKER,
    RESULT_GROUPS_TRANSLATIONS,
    WEEKEND_WEEK_DAYS
} from "../constants";
import {
    durationToISO, extractDuration,
    humanizeDuration, pushAnalytics,
    yandexTrackerIssueUrl,
    yandexTrackerProjectUrl,
    yandexTrackerQueueUrl
} from "../helpers";
import Table from "@mui/material/Table";
import {styled} from "@mui/material/styles";
import {makeStyles} from "@mui/styles"
import Tooltip, {tooltipClasses} from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import moment from "moment";
import CreateWorkLogDialog from "./CreateWorkLogDialog";
import DeleteWorkLogDialog from "./DeleteWorkLogDialog";
import UpdateWorkLogDialog from "./UpdateWorkLogDialog";
import Grid from "@mui/material/Grid";
import DetailsDialog from "./DetailsDialog";
import RestrictionsDialog from "./RestrictionsDialog";
import ChartsDialog from "./ChartsDialog";
import Popper from "@mui/material/Popper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Grow from "@mui/material/Grow";
import {TableVirtuoso} from 'react-virtuoso';
import {useSalaryState} from "../Context/Salary";

const useStyles = makeStyles({
    table: {
        minWidth: 650
    },
    sticky: {
        position: "sticky",
        left: 0,
        background: "white",
        borderRight: "1px solid black",
        width: 500,
        zIndex: 1
    },
    stickyHeader: {
        position: "sticky",
        left: 0,
        background: "white",
        borderRight: "1px solid black",
        width: 500,
        zIndex: "5 !important"
    }
});

const VirtuosoTableComponents = {
    Scroller: React.forwardRef((props, ref) => (
        <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: (props) => (
        <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
    ),
    TableHead,
    TableRow: ({ item: _item, ...props }) => {
        const { context: { rows, }, ...otherProps } = props;
        const index = props['data-index'];
        const item = rows[index];

        return <TableRow {...otherProps} sx={rowSx(item, item.realIndex)} />
    },
    TableBody: React.forwardRef((props, ref) => (
        <TableBody {...props} ref={ref} />
    )),
};

const daySx = (day, isLastRow, duration, limit) => {
    const out = {
        width: 150
    };

    const isWeekend = day.grouped ? false : WEEKEND_WEEK_DAYS.includes(day.includes[0].isoWeekday());

    if ( isWeekend ) {
        out.background = "#F9F7F2";
    }

    if( !isLastRow && limit > 0 && !isWeekend ) {
        const { rawMinutes } = extractDuration(duration);

        if( rawMinutes < limit ) {
            out.background = "rgba(255,0,0,.3);";
        }
    }

    return out;
};

const rowSx = (row, index) => {
    if( row.isMaxDepth ) {
        if( (index+1) %2 === 0 ) {
            return {
                background: 'rgba(0, 0, 0, 0.04)'
            };
        }

        return {};
    }

    return {
        background: DEPTH_COLORS[row.depth]
    };
};

const rowTitle = (row, classes) => {
    const { title, depth } = row;

    const prefix = `\u00A0`.repeat(depth);

    if( row.isSummary ) {
        return <TableCell className={classes.sticky} component="th" scope="row">
            {prefix}{title}
        </TableCell>
    }

    const { parameters: { resultGroup, key } } = row;

    if( resultGroup === RESULT_GROUP_ISSUE ) {
        const { extra: { epicKey, epicDisplay } } = row;

        if( epicKey !== "" ) {
            return <TableCell className={classes.sticky} component="th" scope="row">
                {prefix}<Tooltip title={`${epicKey}: ${epicDisplay}`}>
                    <Link href={yandexTrackerIssueUrl(epicKey)} target="_blank">{epicKey}</Link>
                </Tooltip> / <Link href={yandexTrackerIssueUrl(key)} target="_blank">{title}</Link>
            </TableCell>
        }

        return <TableCell className={classes.sticky} component="th" scope="row">
            {prefix}<Link href={yandexTrackerIssueUrl(key)} target="_blank">{title}</Link>
        </TableCell>
    }

    if( resultGroup === RESULT_GROUP_EPIC ) {
        if( key === "" ) {
            return <TableCell className={classes.sticky} component="th" scope="row">
                {prefix}{title}
            </TableCell>
        }

        return <TableCell className={classes.sticky} component="th" scope="row">
            {prefix}<Link href={yandexTrackerIssueUrl(key)} target="_blank">{title}</Link>
        </TableCell>
    }

    if (resultGroup === RESULT_GROUP_ISSUE_TYPE) {
        return <TableCell className={classes.sticky} component="th" scope="row">
            {prefix}{title}
        </TableCell>
    }

    if( resultGroup === RESULT_GROUP_WORKER ) {
        return <TableCell className={classes.sticky} component="th" scope="row">
            {prefix}{title}
        </TableCell>
    }

    if( resultGroup === RESULT_GROUP_QUEUE ) {
        return <TableCell className={classes.sticky} component="th" scope="row">
            {prefix}<Link href={yandexTrackerQueueUrl(key)} target="_blank">{title}</Link>
        </TableCell>
    }

    if( resultGroup === RESULT_GROUP_PROJECT ) {
        if( key === "" ) {
            return <TableCell className={classes.sticky} component="th" scope="row">
                {prefix}{title}
            </TableCell>
        }

        return <TableCell className={classes.sticky} component="th" scope="row">
            {prefix}<Link href={yandexTrackerProjectUrl(key)} target="_blank">{title}</Link>
        </TableCell>
    }

    return <TableCell className={classes.sticky} component="th" scope="row" />
};

const rowTooltipTitle = row => {
    if( row.parameters ) {
        const { resultGroup, key } = row.parameters;

        if( resultGroup === RESULT_GROUP_ISSUE || resultGroup === RESULT_GROUP_EPIC ) {
            if( key === "" ) {
                return <span>{row.title}</span>
            }

            return <Link href={yandexTrackerIssueUrl(key)} target="_blank">{row.title}</Link>
        }

        if( resultGroup === RESULT_GROUP_PROJECT ) {
            if( key === "" ) {
                return <span>{row.title}</span>
            }

            return <Link href={yandexTrackerProjectUrl(key)} target="_blank">{row.title}</Link>
        }

        if( resultGroup === RESULT_GROUP_QUEUE ) {
            return <Link href={yandexTrackerQueueUrl(key)} target="_blank">{row.title}</Link>
        }
    }

    return <span>{row.title}</span>
};

const rowDescription = row => {
    if( row.description !== "" ) {
        return <TableCell>{row.description}</TableCell>
    }

    return <TableCell />
};

const HtmlTooltip = styled(({className, ...props}) => (
    <Tooltip {...props} classes={{popper: className}}/>
))(({theme}) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: 'rgba(0,0,0,0)',
        maxWidth: 750,
    },
}));

function fixedHeaderContent(dates, classes) {
    return () => {
        return <TableRow sx={{background: "white"}}>
            <TableCell className={classes.stickyHeader}/>
            {dates.map( (date, index) => <TableCell align="center" sx={daySx(date, true, 0, 0)}
                                          key={`table-head-${date.title}`}>
                {date.title}
            </TableCell>)}
            <TableCell align="right" sx={{width: 120}}>Итого</TableCell>
        </TableRow>
    };
}

function ResultTable({workLogs, hideDetails, dateFormat, admin, dates, timeFormat, myUserIdentity, users, showError, startLoading, endLoading, readOnly, showSuccess, resultGroups, boards, userIdentities, setWorkLogs, queues, highlightTime}) {
    const classes = useStyles();

    const [ rows, setRows ] = useState([]);
    const [ restrictionsDialog, setRestrictionsDialog ] = useState(false);
    const [ chartsDialog, setChartsDialog ] = useState( false );

    const [ useVirtuoso, setUseVirtuoso ] = useState(false);

    const [ exportOpen, setExportOpen ] = useState(false);

    const [ salaries ] = useSalaryState();

    const humanize = (duration, detail) => humanizeDuration(duration, timeFormat, detail, salaries);
    const isLastRow = index => rows.length - 1 === index;
    const rowDateExists = (row, date) => !!row.byDate[date.index];
    const rowHaveDetails = (row, date) => rowDateExists(row, date) && row.byDate[date.index].details && row.byDate[date.index].details.length > 0;

    const anchorRef = useRef(null);

    const [detailsDialog, setDetailsDialog] = useState({
        open: false,
        data: null,
        row: null,
        index: 0,
        extraTitle: ""
    });

    const [ createWorkLogData, setCreateWorkLogData ] = useState({
        open: false,
        userIdentity: null,
        projectId: "",
        issueKey: "",
        duration: "",
        comment: "",
        date: {
            includes: [moment()]
        },
        form: CREATE_WORK_LOG_FORM_TYPE_BASIC,
        issueTitle: ""
    });

    const [ deleteWorkLogData, setDeleteWorkLogData ] = useState({
        open: false,
        issueKey: "",
        workLogId: 0,
        title: ""
    });

    const [ updateWorkLogData, setUpdateWorkLogData ] = useState({
        open: false,
        issueKey: "",
        workLogId: 0,
        title: "",
        duration: "",
        comment: ""
    });

    const handleWorkLogUpdateClick = (detail) => {
        setUpdateWorkLogData( prev => ({
            ...prev,
            open: true,
            workLogId: detail.workLogId,
            issueKey: detail.issueKey,
            title: detail.createdByDisplay + ", " + detail.issueTitle + ": " + humanize(detail.value, {[detail.createdById]: detail.value}),
            duration: durationToISO(detail.value),
            comment: detail.description
        }));
    };

    const handleWorkLogDeleteClick = (detail, row) => {
        setDeleteWorkLogData( prev => ({
            ...prev,
            open: true,
            workLogId: detail.workLogId,
            issueKey: detail.issueKey,
            title: detail.createdByDisplay + ", " + detail.issueTitle + ": " + humanize(detail.value, {[detail.createdById]: detail.value})
        }))
    };

    const handleWorkLogCreateClick = (row, date) => {
        setCreateWorkLogData( prev => ({
            ...prev,
            open: true,
            duration: "",
            comment: "",
            projectId: row.projectId,
            userIdentity: !resultGroups.includes(RESULT_GROUP_WORKER) || !admin ? myUserIdentity : parseInt(row.extra.createdById),
            issueKey: row.extra.issueKey,
            date: date,
            form: resultGroups.includes(RESULT_GROUP_ISSUE) ? CREATE_WORK_LOG_FORM_TYPE_BASIC : CREATE_WORK_LOG_FORM_TYPE_ADVANCED,
            issueTitle: row.title,
        }))
    };

    const handleWorkLogCreateClose = () => {
        setCreateWorkLogData( prev => ({...prev, open: false}));
    };

    const handleWorkLogDeleteClose = () => {
        setDeleteWorkLogData( prev => ({...prev, open: false}));
    };

    const handleWorkLogUpdateClose = () => {
        setUpdateWorkLogData( prev => ({...prev, open: false}));
    };

    const handleCreateWorkLogSubmit = workLog => {
        if( userIdentities.length > 0 && !userIdentities.includes(workLog.createdById) ) {
            showSuccess("Рабочее время добавлено, но из-за настроек фильтра не может быть показано.");
        } else {
            showSuccess("Рабочее время добавлено");
            setWorkLogs(prev => [...prev, workLog]);
        }

        handleWorkLogCreateClose();
    };

    const handleDeleteWorkLogSubmit = ({workLogId}) => {
        setWorkLogs(prev => prev.filter( log => {
            return log.workLogId !== workLogId;
        }));

        handleWorkLogDeleteClose();
    };

    const handleUpdateWorkLogSubmit = workLog => {
        setWorkLogs(prev => prev.map(log => {
            if( log.workLogId === workLog.workLogId ) {
                workLog.projectId = log.projectId;

                return workLog;
            }

            return log;
        }));

        handleWorkLogUpdateClose();
    };

    const prepareRows = () => {
        const totalRow = {
            title: "Итого",
            byDate: {},
            byCreatedBy: {},
            isSummary: true,
            value: 0
        };

        // Структура у нас следующая
        // Внешняя группировка
        // Внутренняя группировка
        // Если группировок нет - показываем список задач

        // Сделаем НОВУЮ. Иерархическую структуру.
        // В конце всего - могу лежать задачи (по умолчанию, например, скрытые)

        const groups = {};

        const groupParameters = (workLog, resultGroup) => {
            switch( resultGroup ) {
                case RESULT_GROUP_QUEUE:
                    const queue = queues.find( q => q.value === workLog.queue );

                    return { key: workLog.queue, title: queue ? queue.label : "!" + workLog.queue + "!" };
                case RESULT_GROUP_PROJECT:
                    return { key: workLog.projectId, title: workLog.projectId === "" ? "Проект не указан" : workLog.projectName };
                case RESULT_GROUP_EPIC:
                    return { key: workLog.epicKey, title: workLog.epicKey === "" ? "Эпик не указан" : `${workLog.epicKey}: ${workLog.epicDisplay}` };
                case RESULT_GROUP_WORKER:
                    return { key: workLog.createdById, title: workLog.createByDisplay };
                case RESULT_GROUP_ISSUE_TYPE:
                    return { key: workLog.typeId, title: `${workLog.typeDisplay}` };
            }

            return { key: workLog.issueKey, title: `${workLog.issueKey}: ${workLog.issueDisplay}` };
        };

        for (const workLog of workLogs) {
            const queue = queues.find( q => q.value === workLog.queue );
            const dateKey = dateFormat === DATE_FORMAT_DATE ? moment(workLog.createdAt).format(DATE_FORMAT) : moment(workLog.createdAt).format("MM.YYYY");

            if (!totalRow.byDate[dateKey]) {
                totalRow.byDate[dateKey] = {
                    value: 0,
                    byCreatedBy: {},
                    details: []
                };
            }

            if( !totalRow.byCreatedBy[workLog.createdById] ) {
                totalRow.byCreatedBy[workLog.createdById] = 0;
            }

            if( !totalRow.byDate[dateKey].byCreatedBy[workLog.createdById] ) {
                totalRow.byDate[dateKey].byCreatedBy[workLog.createdById] = 0;
            }

            totalRow.byDate[dateKey].value += workLog.duration;
            totalRow.value += workLog.duration;

            totalRow.byCreatedBy[workLog.createdById] += workLog.duration;
            totalRow.byDate[dateKey].byCreatedBy[workLog.createdById] += workLog.duration;

            let storage = groups;
            let depth = 0;

            for (const resultGroup of resultGroups) {
                if( resultGroup === RESULT_GROUP_NONE ) {
                    break;
                }

                const {key, title} = groupParameters(workLog, resultGroup);

                const isMaxDepth = depth === resultGroups.length - 2;

                if( !storage[key] ) {
                    storage[key] = { // ROW
                        parameters: {
                            resultGroup,
                            key
                        },
                        extra: {
                            issueKey: workLog.issueKey,
                            issueDisplay: `${workLog.issueKey}: ${workLog.issueDisplay}`,
                            issueTitle: workLog.issueDisplay,

                            issueTypeId: workLog.typeId,
                            issueTypeKey: workLog.typeKey,
                            issueTypeDisplay: workLog.typeDisplay,

                            projectId: workLog.projectId,
                            projectName: workLog.projectName,

                            queue: workLog.queue,
                            queueName: queue ? queue.title : "!" + workLog.queue + "!",

                            createdById: workLog.createdById,
                            createdByDisplay: workLog.createByDisplay,

                            epicKey: workLog.epicKey,
                            epicDisplay: workLog.epicDisplay,
                        },
                        title: title,
                        byDate: {},
                        value: 0,
                        byCreatedBy: {},
                        depth: depth,
                        isMaxDepth: isMaxDepth,
                        sub: {}
                    };
                }

                if( !storage[key].byDate[dateKey] ) {
                    storage[key].byDate[dateKey] = {
                        value: 0,
                        byCreatedBy: {},
                        details: []
                    };
                }

                if( !storage[key].byDate[dateKey].byCreatedBy[workLog.createdById] ) {
                    storage[key].byDate[dateKey].byCreatedBy[workLog.createdById] = 0;
                }

                if( !storage[key].byCreatedBy[workLog.createdById] ) {
                    storage[key].byCreatedBy[workLog.createdById] = 0;
                }

                storage[key].value += workLog.duration;
                storage[key].byDate[dateKey].value += workLog.duration;

                storage[key].byCreatedBy[workLog.createdById] += workLog.duration;
                storage[key].byDate[dateKey].byCreatedBy[workLog.createdById] += workLog.duration;

                if( isMaxDepth ) {
                    // Если мы в самом конце списка, самое время подготовить details
                    storage[key].byDate[dateKey].details.push({
                        workLogId: workLog.workLogId,

                        issueKey: workLog.issueKey,
                        issueTitle: `${workLog.issueKey}: ${workLog.issueDisplay}`,

                        createdByDisplay: workLog.createByDisplay,
                        createdById: workLog.createdById,

                        description: workLog.comment,
                        value: workLog.duration,

                        exactDate: moment(workLog.createdAt).format(DATE_FORMAT),

                        isDetails: true
                    });
                }

                storage = storage[key].sub;
                depth++;
            }

        }

        const flatten = (groups, depth) => {
            const flat = [];

            const items = Object.values( groups );

            let iterator = 0;

            items.forEach(item => {
                const {sub, ...rest} = item;

                rest.realIndex = iterator;
                iterator++;

                flat.push(rest);

                if (Object.keys(sub).length > 0) {
                    flat.push(...flatten(sub, depth+1));
                }
            });

            return flat;
        };

        const out = flatten(groups, 0);

        out.push(totalRow);

        setUseVirtuoso( out.length > 200 );

        setRows(out);
    };

    useEffect(() => {
        prepareRows();
    }, [workLogs, resultGroups]);

    const rowContent = (index, row) => {
        const tooltip = (row, date) => {
            if( hideDetails ) {
                return <Button onClick={() => setDetailsDialog(prev => ({
                    ...prev,
                    open: true,
                    row,
                    date,
                    index,
                    extraTitle: rowTooltipTitle(row)
                }))}>
                    {rowDateExists(row, date) && row.byDate[date.index].value > 0 ? humanize(row.byDate[date.index].value, row.byDate[date.index].byCreatedBy) : "---"}
                </Button>
            }

            let cols = 6;

            if( readOnly ) {
                cols--;
            }

            const haveWorkerInChain = resultGroups.includes(RESULT_GROUP_WORKER);
            const haveIssueInChain = resultGroups.includes(RESULT_GROUP_ISSUE);

            const workerIsLastInChain = resultGroups[resultGroups.length - 2] === RESULT_GROUP_WORKER;
            const issueLastInChain = resultGroups[resultGroups.length - 2] === RESULT_GROUP_ISSUE;

            if( haveWorkerInChain ) {
                cols--;
            }

            if( haveIssueInChain ) {
                cols--;
            }

            if( dateFormat === DATE_FORMAT_MONTH ) {
                cols++;
            }

            const showWorkerInCaption = haveWorkerInChain && !workerIsLastInChain;
            const showIssueInCaption = haveIssueInChain && !issueLastInChain;

            const caption = () => { // ISSUE KEY + CREATE BY + FIXATED
                if( showWorkerInCaption && showIssueInCaption ) {
                    return <caption>
                        <Link href={yandexTrackerIssueUrl(row.extra.issueKey)} target="_blank">{row.extra.issueDisplay}</Link>. Автор: {row.extra.createdByDisplay}
                    </caption>
                }

                if( showIssueInCaption ) {
                    return <caption>
                        <Link href={yandexTrackerIssueUrl(row.extra.issueKey)} target="_blank">{row.extra.issueDisplay}</Link>
                    </caption>
                }

                if( showWorkerInCaption ) {
                    return <caption>
                        Автор: {row.extra.createdByDisplay}
                    </caption>
                }

                return null;
            };

            return <HtmlTooltip
                title={
                    <React.Fragment>
                        <TableContainer component={Paper}>
                            <Table sx={{minWidth: 700}}>
                                {caption()}
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={cols}>
                                            <Typography
                                                variant="h5">{date.title} | {rowTooltipTitle(row)}</Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rowHaveDetails(row, date) && row.byDate[date.index].details.map((detail, j) =>
                                        <TableRow key={`details-row-${index}-${j}`}>
                                            {!haveWorkerInChain && <TableCell>
                                                {detail.createdByDisplay}
                                            </TableCell>}
                                            {!haveIssueInChain && <TableCell>
                                                <Link href={yandexTrackerIssueUrl(detail.issueKey)} target="_blank">{detail.issueTitle}</Link>
                                            </TableCell>}
                                            {rowDescription(detail)}
                                            {dateFormat === DATE_FORMAT_MONTH && <TableCell>
                                                {detail.exactDate}
                                            </TableCell>}
                                            <TableCell sx={{minWidth: 120}}>
                                                {humanize(detail.value, {[detail.createdById]: detail.value})}
                                            </TableCell>
                                            {!readOnly && <TableCell align="right" sx={{minWidth: 90}}>
                                                <IconButton size="small" color="warning"
                                                            onClick={() => handleWorkLogUpdateClick(detail, row)}>
                                                    <EditIcon fontSize="inherit"/>
                                                </IconButton>
                                                <IconButton size="small" color="error"
                                                            onClick={() => handleWorkLogDeleteClick(detail, row)}>
                                                    <DeleteIcon fontSize="inherit"/>
                                                </IconButton>
                                            </TableCell>}
                                        </TableRow>)}

                                    {!readOnly && <TableRow>
                                        <TableCell align="center"
                                                   colSpan={cols}>
                                            <IconButton size="small" color="success"
                                                        onClick={() => handleWorkLogCreateClick(row, date)}>
                                                <AddIcon fontSize="inherit"/>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </React.Fragment>
                }
            >
                <Button onClick={() => setDetailsDialog(prev => ({
                    ...prev,
                    open: true,
                    row,
                    date,
                    index,
                    extraTitle: rowTooltipTitle(row)
                }))}>
                    {rowDateExists(row, date) && row.byDate[date.index].value > 0 ? humanize(row.byDate[date.index].value, row.byDate[date.index].byCreatedBy) : "---"}
                </Button>
            </HtmlTooltip>;
        };

        const highlightLessThanMinutes = highlightTime !== false && row.parameters && row.parameters.resultGroup === RESULT_GROUP_WORKER ? highlightTime.minute() + (highlightTime.hour() * 60) : 0;

        return <React.Fragment>
            {rowTitle(row, classes)}

            {dates.map(date => <TableCell align="center" sx={daySx(date, isLastRow(index), rowDateExists(row, date) ? rowDateExists(row, date) && row.byDate[date.index].value : 0, highlightLessThanMinutes)}
                                          key={`table-cell-${index}-${date.index}-${row.title}`}>
                {!isLastRow(index) && row.isMaxDepth && tooltip(row, date)}
                {(isLastRow(index) || !row.isMaxDepth) && <Button disabled={true} sx={{color: "black !important"}}>
                    {rowDateExists(row, date) && row.byDate[date.index].value > 0 ? humanize(row.byDate[date.index].value, row.byDate[date.index].byCreatedBy) : "---"}
                </Button>}
            </TableCell>)}

            <TableCell align="right">
                {humanize(row.value, row.byCreatedBy)}
            </TableCell>
        </React.Fragment>
    };

    const showCharts = () => {
        setChartsDialog(true);
    };

    const exportDataAsIs = () => {
        const header = [
            "Ключ типа", "Тип" // В заголовках AS IS всегда есть тип строки
        ];

        const haveEpicInResultGroups = resultGroups.includes(RESULT_GROUP_EPIC);

        for( const resultGroup of resultGroups ) {
            if( resultGroup === RESULT_GROUP_NONE ) {
                break;
            }

            if( resultGroup === RESULT_GROUP_ISSUE ) {
                if( !haveEpicInResultGroups ) {
                    header.push("Ключ эпика задачи");
                    header.push("Описание эпика задачи");
                }

                header.push("Ключ задачи");
                header.push("Описание задачи");
            } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                header.push("Ключ очереди");
                header.push("Описание очереди");
            } else if( resultGroup === RESULT_GROUP_WORKER ) {
                header.push("ID сотрудника");
                header.push("Email сотрудника");
                header.push("ФИО сотрудника");
            } else if( resultGroup === RESULT_GROUP_EPIC ) {
                header.push("Ключ эпика");
                header.push("Описание эпика");
            } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                header.push("ID проекта");
                header.push("Название проекта");
            } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                header.push("ID Типа задачи");
                header.push("Ключ типа задачи");
                header.push("Тип задачи");
            }
        }

        for( const date of dates ) {
            header.push(date.title);
        }

        header.push("Итого");

        const csv = [
            header.join(";")
        ];

        for( const row of rows ) {
            const parts = [];

            // Тут сложность - надо понять что было ДО, и что будет ПОСЛЕ, что бы заполнить пустые места дефисами

            if( row.isSummary ) {
                parts.push("SUMMARY");
                parts.push("Итого");

                for( const resultGroup of resultGroups ) { // Тут всегда дефисы
                    if( resultGroup === RESULT_GROUP_NONE ) {
                        break;
                    }

                    if( resultGroup === RESULT_GROUP_ISSUE ) {
                        if( !haveEpicInResultGroups ) {
                            parts.push("-");
                            parts.push("-");
                        }

                        parts.push("-");
                        parts.push("-");
                    } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_WORKER ) {
                        parts.push("-");
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_EPIC ) {
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                        parts.push("-");
                        parts.push("-");
                        parts.push("-");
                    }
                }
            } else {
                const { resultGroup: currentResultGroup } = row.parameters;

                parts.push(currentResultGroup);
                parts.push(RESULT_GROUPS_TRANSLATIONS[currentResultGroup]);

                // А тут мы заполняем ТОЛЬКО в том случае если у нас текущий resultGroup === resultGroup, в противном случае -

                for( const resultGroup of resultGroups ) {
                    if( resultGroup === RESULT_GROUP_NONE ) {
                        break;
                    }

                    if( resultGroup === RESULT_GROUP_ISSUE ) {
                        if( !haveEpicInResultGroups ) {
                            parts.push(row.extra.epicKey && currentResultGroup === resultGroup ? row.extra.epicKey : "-");
                            parts.push(row.extra.epicDisplay && currentResultGroup === resultGroup ? row.extra.epicDisplay : "-");
                        }

                        parts.push(currentResultGroup === resultGroup ? row.extra.issueKey : "-");
                        parts.push(currentResultGroup === resultGroup ? row.extra.issueTitle : "-");
                    } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                        parts.push(currentResultGroup === resultGroup ? row.extra.queue : "-");
                        parts.push(currentResultGroup === resultGroup ? row.extra.queueName : "-");
                    } else if( resultGroup === RESULT_GROUP_WORKER ) {
                        const user = users.find( u => u.value === parseInt(row.extra.createdById));

                        parts.push(currentResultGroup === resultGroup ? row.extra.createdById : "-");
                        parts.push(currentResultGroup === resultGroup ? user.email : "-");
                        parts.push(currentResultGroup === resultGroup ? row.extra.createdByDisplay : "-");
                    } else if( resultGroup === RESULT_GROUP_EPIC ) {
                        parts.push(row.extra.epicKey && currentResultGroup === resultGroup ? row.extra.epicKey : "-");
                        parts.push(row.extra.epicDisplay && currentResultGroup === resultGroup ? row.extra.epicDisplay : "-");
                    } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                        parts.push(row.extra.projectId && currentResultGroup === resultGroup ? row.extra.projectId : "-");
                        parts.push(row.extra.projectName && currentResultGroup === resultGroup ? row.extra.projectName : "-");
                    } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                        parts.push(row.extra.issueTypeId && currentResultGroup === resultGroup ? row.extra.issueTypeId : "-");
                        parts.push(row.extra.issueTypeKey && currentResultGroup === resultGroup ? row.extra.issueTypeKey : "-");
                        parts.push(row.extra.issueTypeDisplay && currentResultGroup === resultGroup ? row.extra.issueTypeDisplay : "-");
                    }
                }
            }

            // Мы сдвигаем каждый раз и ставим элементы на свои позиции
            for( const date of dates ) {
                const { rawMinutes } = extractDuration(rowDateExists(row, date) ? row.byDate[date.index].value : 0);

                parts.push(rawMinutes);
            }

            const { rawMinutes } = extractDuration(row.value);

            parts.push( rawMinutes );

            csv.push(parts.join(";"));
        }

        return csv;
    };

    const exportDataOneRow = () => {
        // В одну строчку ВСЁ очень просто
        // Мы перечисляем все resultGroups в начале
        const header = [];

        const haveEpicInResultGroups = resultGroups.includes(RESULT_GROUP_EPIC);

        for( const resultGroup of resultGroups ) {
            if( resultGroup === RESULT_GROUP_NONE ) {
                break;
            }

            if( resultGroup === RESULT_GROUP_ISSUE ) {
                if( !haveEpicInResultGroups ) {
                    header.push("Ключ эпика задачи");
                    header.push("Описание эпика задачи");
                }

                header.push("Ключ задачи");
                header.push("Описание задачи");
            } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                header.push("Ключ очереди");
                header.push("Описание очереди");
            } else if( resultGroup === RESULT_GROUP_WORKER ) {
                header.push("ID сотрудника");
                header.push("Email сотрудника");
                header.push("ФИО сотрудника");
            } else if( resultGroup === RESULT_GROUP_EPIC ) {
                header.push("Ключ эпика");
                header.push("Описание эпика");
            } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                header.push("ID проекта");
                header.push("Название проекта");
            } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                header.push("ID Типа задачи");
                header.push("Ключ типа задачи");
                header.push("Тип задачи");
            }
        }

        for( const date of dates ) {
            header.push(date.title);
        }

        header.push("Итого");

        const csv = [
            header.join(";")
        ];

        for( const row of rows ) {
            if( !row.isMaxDepth && !row.isSummary ) {
                continue;
            }

            const parts = [];

            if( row.isSummary ) {
                parts.push("Итого");

                let offset = 0;

                for (const resultGroup of resultGroups) {
                    if (resultGroup === RESULT_GROUP_NONE) {
                        break;
                    }

                    if (resultGroup === RESULT_GROUP_ISSUE) {
                        if (!haveEpicInResultGroups) {
                            offset+=2;
                        }

                        offset+=2;
                    } else if (resultGroup === RESULT_GROUP_QUEUE) {
                        offset+=2;
                    } else if (resultGroup === RESULT_GROUP_WORKER) {
                        offset+=3;
                    } else if (resultGroup === RESULT_GROUP_EPIC) {
                        offset+=2;
                    } else if (resultGroup === RESULT_GROUP_PROJECT) {
                        offset+=2;
                    } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                        offset+=3;
                    }
                }

                offset--; // За строчку Итого

                while (offset > 0 ) {
                    offset--;

                    parts.push("-");
                }
            } else {
                for (const resultGroup of resultGroups) {
                    if (resultGroup === RESULT_GROUP_NONE) {
                        break;
                    }

                    if (resultGroup === RESULT_GROUP_ISSUE) {
                        if (!haveEpicInResultGroups) {
                            parts.push(row.extra.epicKey ? row.extra.epicKey : "-");
                            parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : "-");
                        }

                        parts.push(row.extra.issueKey);
                        parts.push(row.extra.issueTitle);
                    } else if (resultGroup === RESULT_GROUP_QUEUE) {
                        parts.push(row.extra.queue);
                        parts.push(row.extra.queueName);
                    } else if (resultGroup === RESULT_GROUP_WORKER) {
                        const user = users.find( u => u.value === parseInt(row.extra.createdById));

                        parts.push(row.extra.createdById);
                        parts.push(user.email);
                        parts.push(row.extra.createdByDisplay);
                    } else if (resultGroup === RESULT_GROUP_EPIC) {
                        parts.push(row.extra.epicKey ? row.extra.epicKey : "-");
                        parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : "-");
                    } else if (resultGroup === RESULT_GROUP_PROJECT) {
                        parts.push(row.extra.projectId ? row.extra.projectId : "-");
                        parts.push(row.extra.projectName ? row.extra.projectName : "-");
                    } else if(resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                        parts.push(row.extra.issueTypeId ? row.extra.issueTypeId : "-");
                        parts.push(row.extra.issueTypeKey ? row.extra.issueTypeKey : "-");
                        parts.push(row.extra.issueTypeDisplay ? row.extra.issueTypeDisplay : "-");
                    }
                }
            }

            // Мы сдвигаем каждый раз и ставим элементы на свои позиции
            for (const date of dates) {
                const {rawMinutes} = extractDuration(rowDateExists(row, date) ? row.byDate[date.index].value : 0);

                parts.push(rawMinutes);
            }

            const { rawMinutes } = extractDuration(row.value);

            parts.push( rawMinutes );

            csv.push(parts.join(";"));
        }

        return csv;
    };

    const exportDataOneRowWithDate = () => {
        // В одну строчку ВСЁ очень просто
        // Мы перечисляем все resultGroups в начале
        const header = [];

        const haveEpicInResultGroups = resultGroups.includes(RESULT_GROUP_EPIC);

        for( const resultGroup of resultGroups ) {
            if( resultGroup === RESULT_GROUP_NONE ) {
                break;
            }

            if( resultGroup === RESULT_GROUP_ISSUE ) {
                if( !haveEpicInResultGroups ) {
                    header.push("Ключ эпика задачи");
                    header.push("Описание эпика задачи");
                }

                header.push("Ключ задачи");
                header.push("Описание задачи");
            } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                header.push("Ключ очереди");
                header.push("Описание очереди");
            } else if( resultGroup === RESULT_GROUP_WORKER ) {
                header.push("ID сотрудника");
                header.push("Email сотрудника");
                header.push("ФИО сотрудника");
            } else if( resultGroup === RESULT_GROUP_EPIC ) {
                header.push("Ключ эпика");
                header.push("Описание эпика");
            } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                header.push("ID проекта");
                header.push("Название проекта");
            } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                header.push("ID Типа задачи");
                header.push("Ключ типа задачи");
                header.push("Тип задачи");
            }
        }

        header.push("Дата");
        header.push("Значение");

        const csv = [
            header.join(";")
        ];

        for( const row of rows ) {
            if( !row.isMaxDepth || row.isSummary ) {
                continue;
            }

            const parts = [];

            for (const resultGroup of resultGroups) {
                if (resultGroup === RESULT_GROUP_NONE) {
                    break;
                }

                if (resultGroup === RESULT_GROUP_ISSUE) {
                    if (!haveEpicInResultGroups) {
                        parts.push(row.extra.epicKey ? row.extra.epicKey : "-");
                        parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : "-");
                    }

                    parts.push(row.extra.issueKey);
                    parts.push(row.extra.issueTitle);
                } else if (resultGroup === RESULT_GROUP_QUEUE) {
                    parts.push(row.extra.queue);
                    parts.push(row.extra.queueName);
                } else if (resultGroup === RESULT_GROUP_WORKER) {
                    const user = users.find( u => u.value === parseInt(row.extra.createdById));

                    parts.push(row.extra.createdById);
                    parts.push(user.email);
                    parts.push(row.extra.createdByDisplay);
                } else if (resultGroup === RESULT_GROUP_EPIC) {
                    parts.push(row.extra.epicKey ? row.extra.epicKey : "-");
                    parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : "-");
                } else if (resultGroup === RESULT_GROUP_PROJECT) {
                    parts.push(row.extra.projectId ? row.extra.projectId : "-");
                    parts.push(row.extra.projectName ? row.extra.projectName : "-");
                } else if(resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                    parts.push(row.extra.issueTypeId ? row.extra.issueTypeId : "-");
                    parts.push(row.extra.issueTypeKey ? row.extra.issueTypeKey : "-");
                    parts.push(row.extra.issueTypeDisplay ? row.extra.issueTypeDisplay : "-");
                }
            }

            // Мы сдвигаем каждый раз и ставим элементы на свои позиции
            for (const date of dates) {
                const clone = JSON.parse(JSON.stringify(parts));


                const {rawMinutes} = extractDuration(rowDateExists(row, date) ? row.byDate[date.index].value : 0);

                if( rawMinutes === 0 ) {
                    continue;
                }

                clone.push(date.title);
                clone.push(rawMinutes);

                csv.push(clone.join(";"));
            }
        }

        return csv;
    };

    const exportDataShort = () => {
        const header = [
            "Ключ типа", "Тип" // В заголовках AS IS всегда есть тип строки
        ];

        const haveEpicInResultGroups = resultGroups.includes(RESULT_GROUP_EPIC);

        for( const resultGroup of resultGroups ) {
            if( resultGroup === RESULT_GROUP_NONE ) {
                break;
            }

            if( resultGroup === RESULT_GROUP_ISSUE ) {
                if( !haveEpicInResultGroups ) {
                    header.push("Ключ эпика задачи");
                    header.push("Описание эпика задачи");
                }

                header.push("Ключ задачи");
                header.push("Описание задачи");
            } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                header.push("Ключ очереди");
                header.push("Описание очереди");
            } else if( resultGroup === RESULT_GROUP_WORKER ) {
                header.push("ФИО сотрудника");
            } else if( resultGroup === RESULT_GROUP_EPIC ) {
                header.push("Ключ эпика");
                header.push("Описание эпика");
            } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                header.push("ID проекта");
                header.push("Название проекта");
            } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                header.push("ID Типа задачи");
                header.push("Ключ типа задачи");
                header.push("Тип задачи");
            }
        }

        header.push("Итого");

        const csv = [
            header.join(";")
        ];

        for( const row of rows ) {
            const parts = [];

            // Тут сложность - надо понять что было ДО, и что будет ПОСЛЕ, что бы заполнить пустые места дефисами

            if( row.isSummary ) {
                parts.push("SUMMARY");
                parts.push("Итого");

                for( const resultGroup of resultGroups ) { // Тут всегда дефисы
                    if( resultGroup === RESULT_GROUP_NONE ) {
                        break;
                    }

                    if( resultGroup === RESULT_GROUP_ISSUE ) {
                        if( !haveEpicInResultGroups ) {
                            parts.push("-");
                            parts.push("-");
                        }

                        parts.push("-");
                        parts.push("-");
                    } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_WORKER ) {
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_EPIC ) {
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                        parts.push("-");
                        parts.push("-");
                        parts.push("-");
                    }
                }
            } else {
                const { resultGroup: currentResultGroup } = row.parameters;

                if( currentResultGroup === RESULT_GROUP_ISSUE ) {
                    continue;
                }

                parts.push(currentResultGroup);
                parts.push(RESULT_GROUPS_TRANSLATIONS[currentResultGroup]);

                // А тут мы заполняем ТОЛЬКО в том случае если у нас текущий resultGroup === resultGroup, в противном случае -

                for( const resultGroup of resultGroups ) {
                    if( resultGroup === RESULT_GROUP_NONE ) {
                        break;
                    }

                    if( resultGroup === RESULT_GROUP_ISSUE ) {
                        if( !haveEpicInResultGroups ) {
                            parts.push(row.extra.epicKey ? row.extra.epicKey : "-");
                            parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : "-");
                        }

                        parts.push(row.extra.issueKey);
                        parts.push(row.extra.issueTitle);
                    } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                        parts.push(currentResultGroup === resultGroup ? row.extra.queue : "-");
                        parts.push(currentResultGroup === resultGroup ? row.extra.queueName : "-");
                    } else if( resultGroup === RESULT_GROUP_WORKER ) {
                        parts.push(currentResultGroup === resultGroup ? row.extra.createdByDisplay : "-");
                    } else if( resultGroup === RESULT_GROUP_EPIC ) {
                        parts.push(row.extra.epicKey && currentResultGroup === resultGroup ? row.extra.epicKey : "-");
                        parts.push(row.extra.epicDisplay && currentResultGroup === resultGroup ? row.extra.epicDisplay : "-");
                    } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                        parts.push(row.extra.projectId && currentResultGroup === resultGroup ? row.extra.projectId : "-");
                        parts.push(row.extra.projectName && currentResultGroup === resultGroup ? row.extra.projectName : "-");
                    } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                        parts.push(row.extra.issueTypeId && currentResultGroup === resultGroup ? row.extra.issueTypeId : "-");
                        parts.push(row.extra.issueTypeKe && currentResultGroup === resultGroup ? row.extra.issueTypeKey : "-");
                        parts.push(row.extra.issueTypeDisplay && currentResultGroup === resultGroup ? row.extra.issueTypeDisplay : "-");
                    }
                }
            }

            const { rawMinutes } = extractDuration(row.value);

            parts.push( rawMinutes );

            csv.push(parts.join(";"));
        }

        return csv;
    };

    const exportData = variant => {
        // По сути теперь ВСЁ что мы выводим - должно быть норм
        // Только в срочке с задачей - может быть дополнительно указан epic

        // Думаю что выгрузку стоит делать вложенную, со сдвигом ячеек

        // У нас будет 2 типа экспорта
        // Первый - съезжают заголовки -> каждый на своей строчке. В первой строчке будет тип строчки
        // Второй - в рамках последовательности будут одинаковые строчки

        const csv = variant === EXPORT_VARIANT_AS_IS ? exportDataAsIs() : (variant === EXPORT_VARIANT_ONE_ROW ? exportDataOneRow() : (variant === EXPORT_VARIANT_SHORT ? exportDataShort() : exportDataOneRowWithDate()));
        const bom = "\uFEFF";
        const encodedCsv = csv.map(row => encodeURIComponent(row.replace(/(\r\n|\n|\r)/gm, ""))).join("\n");

        const hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + bom + encodedCsv;
        hiddenElement.target = '_blank';

        hiddenElement.download = `export-time-sheet-${variant}.csv`;
        hiddenElement.click();
    };

    return <React.Fragment>
        <ChartsDialog state={chartsDialog} dateFormat={dateFormat} workLogs={workLogs} handleClose={() => setChartsDialog(false)} timeFormat={timeFormat} dates={dates} />

        <RestrictionsDialog state={restrictionsDialog} handleClose={() => setRestrictionsDialog(false)} readOnly={readOnly} admin={admin} />

        <CreateWorkLogDialog admin={admin} state={createWorkLogData.open} boards={boards} handleClose={handleWorkLogCreateClose} data={createWorkLogData} setData={setCreateWorkLogData} users={users} showError={showError} showSuccess={showSuccess} myUserIdentity={myUserIdentity} startLoading={startLoading} endLoading={endLoading} onSubmit={handleCreateWorkLogSubmit} resultGroups={resultGroups} />

        <DeleteWorkLogDialog state={deleteWorkLogData.open} issueKey={deleteWorkLogData.issueKey} workLogId={deleteWorkLogData.workLogId} handleCLose={handleWorkLogDeleteClose} title={deleteWorkLogData.title} showError={showError} showSuccess={showSuccess} startLoading={startLoading} endLoading={endLoading} onSubmit={handleDeleteWorkLogSubmit} />

        <UpdateWorkLogDialog state={updateWorkLogData.open} issueKey={updateWorkLogData.issueKey} workLogId={updateWorkLogData.workLogId} handleClose={handleWorkLogUpdateClose} title={updateWorkLogData.title} showError={showError} showSuccess={showSuccess} startLoading={startLoading} endLoading={endLoading} onSubmit={handleUpdateWorkLogSubmit} data={updateWorkLogData} />

        <DetailsDialog
            dateFormat={dateFormat}
            state={detailsDialog.open}
            resultGroups={resultGroups}
            handleClose={() => setDetailsDialog( prev => ({...prev, open: false}))}
            date={detailsDialog.date}
            row={detailsDialog.row}
            extraTitle={detailsDialog.extraTitle}
            rowHaveDetails={rowHaveDetails}
            rowDescription={rowDescription}
            humanize={humanize}
            handleWorkLogUpdateClick={handleWorkLogUpdateClick}
            handleWorkLogDeleteClick={handleWorkLogDeleteClick}
            handleWorkLogCreateClick={handleWorkLogCreateClick}
            index={detailsDialog.index}
            readOnly={readOnly}
        />

        <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
                {(readOnly || !admin) && <span>
                    На вашу учётную запись действуют ограничения. <Button onClick={() => setRestrictionsDialog(true)}>Подробнее</Button>
                </span>}
            </Grid>

            <Grid item xs={12} md={2}>
                <Button fullWidth color="info" variant="outlined" onClick={() => { showCharts(); pushAnalytics("chartsButtonClick"); }}>Графики</Button>
            </Grid>

            <Grid item xs={12} md={2}>
                <Button
                    fullWidth
                    ref={anchorRef}
                    color="success"
                    variant="outlined"
                    id="composition-button"
                    aria-controls={exportOpen ? 'composition-menu' : undefined}
                    aria-expanded={exportOpen ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={() => { setExportOpen(true); pushAnalytics("exportButtonClick"); }}
                >
                    Экспорт
                </Button>
                <Popper
                    open={exportOpen}
                    anchorEl={anchorRef.current}
                    sx={{zIndex:99}}
                    placement="bottom-start"
                    transition
                    disablePortal
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin:
                                    placement === 'bottom-start' ? 'left top' : 'left bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={() => setExportOpen(false)}>
                                    <MenuList
                                        autoFocusItem={exportOpen}
                                        id="composition-menu"
                                        aria-labelledby="composition-button"
                                    >
                                        <MenuItem onClick={() => { exportData(EXPORT_VARIANT_AS_IS); pushAnalytics("export", { variant: EXPORT_VARIANT_AS_IS }); setExportOpen(false); }}>Стандартный</MenuItem>
                                        <MenuItem onClick={() => { exportData(EXPORT_VARIANT_ONE_ROW); pushAnalytics("export", { variant: EXPORT_VARIANT_ONE_ROW }); setExportOpen(false); }}>В одну строчку (по датам)</MenuItem>
                                        <MenuItem onClick={() => { exportData(EXPORT_VARIANT_ONE_ROW_WITH_DATE); pushAnalytics("export", { variant: EXPORT_VARIANT_ONE_ROW_WITH_DATE }); setExportOpen(false); }}>В одну строчку (с датой)</MenuItem>
                                        <MenuItem onClick={() => { exportData(EXPORT_VARIANT_SHORT); pushAnalytics("export", { variant: EXPORT_VARIANT_SHORT }); setExportOpen(false); }}>Короткий</MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </Grid>



            <Grid item xs={12}>
                {useVirtuoso && <Paper style={{ height: 700, width: '100%'}}>
                    <TableVirtuoso
                        context={{ rows }}
                        data={rows}
                        itemContent={rowContent}
                        fixedHeaderContent={fixedHeaderContent(dates, classes)}
                        components={VirtuosoTableComponents} />
                </Paper>}
                {!useVirtuoso && <TableContainer component={Paper} sx={{ maxHeight: 700 }}>
                    <Table stickyHeader className={classes.table} style={{ tableLayout: "fixed" }}>
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.stickyHeader}>
                                    &nbsp;
                                </TableCell>
                                {dates.map(date => <TableCell align="center" sx={daySx(date, true, 0, 0)}
                                                              key={`table-head-${date.title}`}>
                                    {date.title}
                                </TableCell>)}
                                <TableCell align="right" sx={{minWidth: 120, width: 120}}>Итого</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, index) => <TableRow sx={rowSx(row, row.realIndex)} key={`table-row-${index}`}>{rowContent(index, row)}</TableRow>)}
                        </TableBody>
                    </Table>
                </TableContainer>}
            </Grid>
        </Grid>
    </React.Fragment>
}

export default ResultTable;