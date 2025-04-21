import React, {Fragment, useEffect, useState} from "react";
import {
    Paper,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Table,
    Grid2 as Grid,
    Button
} from "@mui/material";
import {makeStyles} from "@mui/styles"
import moment from "moment";
import {Trans, useTranslation} from "react-i18next";
import {useAtom, useAtomValue} from "jotai";
import {
    VIRTUOSO_MIN_LENGTH,
} from "../constants";
import {
    daySx,
    pushAnalytics,
    rowSx,
} from "../helpers";
import CreateWorkLogDialog from "./CreateWorkLogDialog";
import DeleteWorkLogDialog from "./DeleteWorkLogDialog";
import UpdateWorkLogDialog from "./UpdateWorkLogDialog";
import DetailsDialog from "./DetailsDialog";
import RestrictionsDialog from "./RestrictionsDialog";
import ChartsDialog from "./ChartsDialog";
import {TableVirtuoso} from 'react-virtuoso';
import InsightsDialog from "./InsightsDialog";
import {
    workLogsAtom,
    resultRowsAtom,
    myUserAtom, datesAtom
} from "../jotai/atoms";
import {ExportButton} from "./ExportButton";
import {ResultTableRowContent} from "./ResultTable/RowContent";

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
        <TableContainer component={Paper} {...props} ref={ref}/>
    )),
    Table: (props) => (
        <Table {...props} sx={{borderCollapse: 'separate', tableLayout: 'fixed'}}/>
    ),
    TableHead,
    TableRow: ({item: _item, ...props}) => {
        const {context: {rows,}, ...otherProps} = props;
        const index = props['data-index'];
        const item = rows[index];

        return <TableRow {...otherProps} sx={rowSx(item, item.realIndex)}/>
    },
    TableBody: React.forwardRef((props, ref) => (
        <TableBody {...props} ref={ref}/>
    )),
};

function fixedHeaderContent(dates, classes, t) {
    return () => {
        return <TableRow sx={{background: "white"}}>
            <TableCell className={classes.stickyHeader}/>
            {dates.map((date, index) => <TableCell align="center" sx={daySx(date, true, 0, 0)}
                                                   key={`table-head-${date.title}`}>
                {date.title}
            </TableCell>)}
            <TableCell align="right" sx={{width: 120}}>{t('common:total')}</TableCell>
        </TableRow>
    };
}

function ResultTable({showError, showSuccess}) {
    const {t} = useTranslation();
    const classes = useStyles();

    const rows = useAtomValue(resultRowsAtom);
    const myUser = useAtomValue(myUserAtom);
    const dates = useAtomValue(datesAtom);
    const [workLogs, setWorkLogs] = useAtom(workLogsAtom);

    const [insightRow, setInsightRow] = useState({});
    const [insightDialog, setInsightDialog] = useState(false);

    const [restrictionsDialog, setRestrictionsDialog] = useState(false);
    const [chartsDialog, setChartsDialog] = useState(false);

    const [useVirtuoso, setUseVirtuoso] = useState(false);

    const [createWorkLogData, setCreateWorkLogData] = useState({
        open: false,
        userIdentity: null,
        projectId: "",
        issueKey: "",
        duration: "",
        comment: "",
        date: {
            includes: [moment()]
        },
        issueTitle: ""
    });

    const [updateWorkLogData, setUpdateWorkLogData] = useState({
        open: false,
        issueKey: "",
        workLogId: 0,
        title: "",
        duration: "",
        comment: ""
    });

    const handleWorkLogUpdateClose = () => {
        setUpdateWorkLogData(prev => ({...prev, open: false}));
    };

    const handleUpdateWorkLogSubmit = workLog => {
        setWorkLogs(prev => prev.map(log => {
            if (log.workLogId === workLog.workLogId) {
                workLog.projectId = log.projectId;

                return workLog;
            }

            return log;
        }));

        handleWorkLogUpdateClose();
    };

    useEffect(() => {
        setUseVirtuoso(rows.length > VIRTUOSO_MIN_LENGTH);
    }, [rows]);

    const showCharts = () => {
        setChartsDialog(true);
    };

    return <Fragment>
        <InsightsDialog handleClose={() => setInsightDialog(false)} row={insightRow} state={insightDialog} rows={rows}/>

        <ChartsDialog state={chartsDialog} workLogs={workLogs} handleClose={() => setChartsDialog(false)}/>

        <RestrictionsDialog state={restrictionsDialog} handleClose={() => setRestrictionsDialog(false)}/>
        <CreateWorkLogDialog setData={setCreateWorkLogData} showError={showError} showSuccess={showSuccess}/>
        <DeleteWorkLogDialog showError={showError} showSuccess={showSuccess}/>
        <UpdateWorkLogDialog showError={showError} showSuccess={showSuccess} onSubmit={handleUpdateWorkLogSubmit}/>

        <DetailsDialog/>

        <Grid container spacing={2}>
            <Grid size={{xs: 12, md: 8}}>
                {(myUser.isReadOnly || !myUser.isAdmin) && <span>
                    <Trans
                        i18nKey='components:result_table.restrictions_text'
                        components={{
                            details: <Button onClick={() => setRestrictionsDialog(true)}/>
                        }}
                    />
                </span>}
            </Grid>

            <Grid size={{xs: 12, md: 2}}>
                <Button fullWidth color="info" variant="outlined" onClick={() => {
                    showCharts();
                    pushAnalytics("chartsButtonClick");
                }}>{t('common:button.charts')}</Button>
            </Grid>

            <Grid size={{xs: 12, md: 2}}>
                <ExportButton/>
            </Grid>

            <Grid size={12}>
                {useVirtuoso && <Paper style={{height: 670, width: '100%'}}>
                    <TableVirtuoso
                        context={{rows}}
                        data={rows}
                        itemContent={(index, row) => <ResultTableRowContent row={row} index={index}
                                                                            setInsightRow={setInsightRow}
                                                                            setInsightDialog={setInsightDialog}/>}
                        fixedHeaderContent={fixedHeaderContent(dates, classes, t)}
                        components={VirtuosoTableComponents}/>
                </Paper>}
                {!useVirtuoso && <TableContainer component={Paper} sx={{maxHeight: 670}}>
                    <Table stickyHeader className={classes.table} style={{tableLayout: "fixed"}}>
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.stickyHeader}>
                                    &nbsp;
                                </TableCell>
                                {dates.map(date => <TableCell align="center" sx={daySx(date, true, 0, 0)}
                                                              key={`table-head-${date.title}`}>
                                    {date.title}
                                </TableCell>)}
                                <TableCell align="right"
                                           sx={{minWidth: 120, width: 120}}>{t('common:total')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, index) => <TableRow sx={rowSx(row, row.realIndex)}
                                                                key={`table-row-${index}`}>
                                <ResultTableRowContent row={row} index={index} setInsightRow={setInsightRow}
                                                       setInsightDialog={setInsightDialog}/>
                            </TableRow>)}
                        </TableBody>
                    </Table>
                </TableContainer>}
            </Grid>
        </Grid>
    </Fragment>
}

export default ResultTable;