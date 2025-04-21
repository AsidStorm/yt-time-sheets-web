import React from "react";
import {Dialog, DialogContent} from "@mui/material";
import {ResultDetailsTable} from "./ResultTable/DetailsTable";
import {useDetailsDialog} from "../hooks/detailsDialog";

function DetailsDialog() {
    const {isOpen, close, index, date, row} = useDetailsDialog();

    return <Dialog onClose={close} open={isOpen} fullWidth maxWidth="lg">
        <DialogContent sx={{p: 0}}>
            {isOpen && <ResultDetailsTable row={row} date={date} index={index}/>}
        </DialogContent>
    </Dialog>
}

export default DetailsDialog;