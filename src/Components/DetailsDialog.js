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
import {calculateDetailsCols, rowHaveDetails, yandexTrackerIssueUrl} from "../helpers";
import {useHumanizeDuration} from "../hooks";
import {useAtomValue} from "jotai";
import {dateFormatAtom, myUserAtom, resultGroupsAtom} from "../jotai/atoms";
import {RowDescription} from "./ResultTable/RowDescription";
import {ResultDetailsTable} from "./ResultTable/DetailsTable";
import {useDetailsDialog} from "../hooks/detailsDialog";

function DetailsDialog() {
    const { isOpen, close, index, date, row } = useDetailsDialog();

    return <Dialog onClose={close} open={isOpen} fullWidth maxWidth="lg">
        <DialogContent sx={{p: 0}}>
            {isOpen && <ResultDetailsTable row={row} date={date} index={index} />}
        </DialogContent>
    </Dialog>
}

export default DetailsDialog;