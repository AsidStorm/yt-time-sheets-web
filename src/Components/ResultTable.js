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
import {Trans, useTranslation} from "react-i18next";
import {useAtomValue} from "jotai";
import {
    VIRTUOSO_MIN_LENGTH,
} from "../constants";
import {
    pushAnalytics,
    rowSx,
} from "../helpers";
import CreateWorkLogDialog from "./CreateWorkLogDialog";
import DeleteWorkLogDialog from "./DeleteWorkLogDialog";
import UpdateWorkLogDialog from "./UpdateWorkLogDialog";
import DetailsDialog from "./DetailsDialog";
import ChartsDialog from "./ChartsDialog";
import {TableVirtuoso} from 'react-virtuoso';
import InsightsDialog from "./InsightsDialog";
import {
    resultRowsAtom,
    myUserAtom,
    datesAtom
} from "../jotai/atoms";
import {ExportButton} from "./ExportButton";
import {ResultTableRowContent} from "./ResultTable/RowContent";
import {useDateFormatter} from "../hooks";
import {DialogsRestrictions} from "./Dialogs/Restrictions";
import {ResultTableHeader} from "./ResultTable/Header";

const useStyles = makeStyles({
    table: {
        minWidth: 650
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

function ResultTable() {
    const {t} = useTranslation();
    const classes = useStyles();

    const rows = useAtomValue(resultRowsAtom);
    const myUser = useAtomValue(myUserAtom);
    const dates = useAtomValue(datesAtom);

    const { formatDate } = useDateFormatter();

    const [restrictionsDialog, setRestrictionsDialog] = useState(false);
    const [chartsDialog, setChartsDialog] = useState(false);

    const [useVirtuoso, setUseVirtuoso] = useState(false);

    useEffect(() => {
        setUseVirtuoso(rows.length > VIRTUOSO_MIN_LENGTH);
    }, [rows]);

    const showCharts = () => {
        setChartsDialog(true);
    };

    return <Fragment>
        <InsightsDialog />

        <ChartsDialog state={chartsDialog} handleClose={() => setChartsDialog(false)}/>

        <DialogsRestrictions state={restrictionsDialog} handleClose={() => setRestrictionsDialog(false)}/>
        <CreateWorkLogDialog />
        <DeleteWorkLogDialog />
        <UpdateWorkLogDialog />

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
                        itemContent={(index, row) => <ResultTableRowContent row={row} index={index} />}
                        fixedHeaderContent={() => <ResultTableHeader />}
                        components={VirtuosoTableComponents}/>
                </Paper>}
                {!useVirtuoso && <TableContainer component={Paper} sx={{maxHeight: 670}}>
                    <Table stickyHeader className={classes.table} style={{tableLayout: "fixed"}}>
                        <TableHead>
                            <ResultTableHeader />
                        </TableHead>
                        <TableBody>
                            {rows.map((row, index) => <TableRow sx={rowSx(row, row.realIndex)}
                                                                key={`table-row-${index}`}>
                                <ResultTableRowContent row={row} index={index} />
                            </TableRow>)}
                        </TableBody>
                    </Table>
                </TableContainer>}
            </Grid>
        </Grid>
    </Fragment>
}

export default ResultTable;