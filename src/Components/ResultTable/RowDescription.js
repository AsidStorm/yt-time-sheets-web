import TableCell from "@mui/material/TableCell";
import React from "react";

export function RowDescription({ row }) {
    if( row.description !== "" ) {
        return <TableCell>{row.description}</TableCell>
    }

    return <TableCell />
}