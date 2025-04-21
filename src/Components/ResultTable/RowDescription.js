import React from "react";
import {TableCell} from "@mui/material";

export function RowDescription({ row }) {
    if( row.description !== "" ) {
        return <TableCell>{row.description}</TableCell>
    }

    return <TableCell />
}