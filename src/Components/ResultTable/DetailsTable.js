import React from "react";
import {Paper, Table, TableHead, TableRow, TableCell, Typography, TableBody, Link, IconButton} from "@mui/material";
import {useAtomValue} from "jotai";
import {calculateDetailsCols, rowHaveDetails, yandexTrackerIssueUrl} from "../../helpers";
import {RowDescription} from "./RowDescription";
import {DATE_FORMAT_MONTH, RESULT_GROUP_ISSUE, RESULT_GROUP_WORKER} from "../../constants";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import TableContainer from "@mui/material/TableContainer";
import {useCreateWorkLogDialog, useDeleteWorkLogDialog, useHumanizeDuration, useUpdateWorkLogDialog} from "../../hooks";
import {dateFormatAtom, myUserAtom, resultGroupsAtom} from "../../jotai/atoms";
import {RowTooltipTitle} from "./RowTooltipTitle";

export function ResultDetailsTable({index, row, date}) {
    const humanize = useHumanizeDuration();

    const {open: openWorkLogDeleteDialog} = useDeleteWorkLogDialog();
    const {open: openWorkLogCreateDialog} = useCreateWorkLogDialog();
    const {open: openWorkLogUpdateDialog} = useUpdateWorkLogDialog();

    const dateFormat = useAtomValue(dateFormatAtom);
    const resultGroups = useAtomValue(resultGroupsAtom);
    const myUser = useAtomValue(myUserAtom);

    const haveWorkerInChain = resultGroups.includes(RESULT_GROUP_WORKER);
    const haveIssueInChain = resultGroups.includes(RESULT_GROUP_ISSUE);

    const workerIsLastInChain = resultGroups[resultGroups.length - 2] === RESULT_GROUP_WORKER;
    const issueLastInChain = resultGroups[resultGroups.length - 2] === RESULT_GROUP_ISSUE;

    const showWorkerInCaption = haveWorkerInChain && !workerIsLastInChain;
    const showIssueInCaption = haveIssueInChain && !issueLastInChain;

    const cols = calculateDetailsCols(myUser.isReadOnly, haveWorkerInChain, haveIssueInChain, haveIssueInChain, dateFormat);

    function Caption({showWorkerInCaption, showIssueInCaption, issueKey, issueDisplay, createdByDisplay}) {
        if (showWorkerInCaption && showIssueInCaption) {
            return <caption>
                <Link href={yandexTrackerIssueUrl(issueKey)} target="_blank"
                      rel="nofollow noreferer">{issueDisplay}</Link>. Автор: {createdByDisplay}
            </caption>
        }

        if (showIssueInCaption) {
            return <caption>
                <Link href={yandexTrackerIssueUrl(issueKey)} target="_blank"
                      rel="nofollow noreferer">{issueDisplay}</Link>
            </caption>
        }

        if (showWorkerInCaption) {
            return <caption>
                Автор: {createdByDisplay}
            </caption>
        }

        return null;
    }

    return <TableContainer component={Paper}>
        <Table sx={{minWidth: 700}}>
            <Caption createdByDisplay={row.extra.createdByDisplay} issueKey={row.extra.issueKey}
                     issueDisplay={row.extra.issueDisplay} showWorkerInCaption={showWorkerInCaption}
                     showIssueInCaption={showIssueInCaption}/>
            <TableHead>
                <TableRow>
                    <TableCell colSpan={cols}>
                        <Typography
                            variant="h5">{date.title} | <RowTooltipTitle row={row}/></Typography>
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
                            <Link href={yandexTrackerIssueUrl(detail.issueKey)}
                                  target="_blank">{detail.issueTitle}</Link>
                        </TableCell>}
                        <RowDescription row={detail}/>
                        {dateFormat === DATE_FORMAT_MONTH && <TableCell>
                            {detail.exactDate}
                        </TableCell>}
                        <TableCell sx={{minWidth: 120}}>
                            {humanize(detail.value, {[detail.createdById]: detail.value})}
                        </TableCell>
                        {!myUser.isReadOnly && <TableCell align="right" sx={{minWidth: 90}}>
                            <IconButton size="small" color="warning"
                                        onClick={() => openWorkLogUpdateDialog(detail)}>
                                <EditIcon fontSize="inherit"/>
                            </IconButton>
                            <IconButton size="small" color="error"
                                        onClick={() => openWorkLogDeleteDialog(detail)}>
                                <DeleteIcon fontSize="inherit"/>
                            </IconButton>
                        </TableCell>}
                    </TableRow>)}

                {!myUser.isReadOnly && <TableRow>
                    <TableCell align="center"
                               colSpan={cols}>
                        <IconButton size="small" color="success"
                                    onClick={() => openWorkLogCreateDialog(row, date)}>
                            <AddIcon fontSize="inherit"/>
                        </IconButton>
                    </TableCell>
                </TableRow>}
            </TableBody>
        </Table>
    </TableContainer>
}