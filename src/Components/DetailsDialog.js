import Dialog from "@mui/material/Dialog";
import React from "react";
import DialogContent from "@mui/material/DialogContent";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import {DATE_FORMAT_MONTH, RESULT_GROUP_ISSUE, RESULT_GROUP_WORKER} from "../constants";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import TableContainer from "@mui/material/TableContainer";
import Link from "@mui/material/Link";
import {yandexTrackerIssueUrl} from "../helpers";

function DetailsDialog({state, dateFormat, index, readOnly, handleClose, date, row, rowHaveDetails, rowDescription, humanize, handleWorkLogUpdateClick, handleWorkLogDeleteClick, handleWorkLogCreateClick, extraTitle, resultGroups}) {
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

    return <Dialog onClose={handleClose} open={state} fullWidth maxWidth="lg">
        <DialogContent sx={{padding: 0 + "!important"}}>
            {state && <TableContainer component={Paper}>
                <Table sx={{minWidth: 700}}>
                    {caption()}
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={cols}>
                                <Typography
                                    variant="h5">{date.title} | {extraTitle}</Typography>
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
            </TableContainer>}
        </DialogContent>
    </Dialog>
}

export default DetailsDialog;