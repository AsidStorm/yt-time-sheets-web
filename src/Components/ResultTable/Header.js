import {TableCell, TableRow} from "@mui/material";
import {daySx} from "../../helpers";
import React from "react";
import {useDateFormatter} from "../../hooks";
import {useAtomValue} from "jotai/index";
import {datesAtom} from "../../jotai/atoms";
import {makeStyles} from "@mui/styles";
import {useTranslation} from "react-i18next";
import {COLOR_THEME_DARK} from "../../constants";

const useStyles = makeStyles({
    stickyHeader: {
        position: "sticky",
        left: 0,
        borderRight: "1px solid black",
        width: 500,
        zIndex: "5 !important"
    }
});

export function ResultTableHeader() {
    const {t} = useTranslation();
    const classes = useStyles();

    const dates = useAtomValue(datesAtom);

    const { formatDate } = useDateFormatter();

    return <TableRow sx={{background: theme => theme.palette.mode === COLOR_THEME_DARK ? "black" : "white"}}>
        <TableCell className={classes.stickyHeader} sx={{background: theme => theme.palette.mode === COLOR_THEME_DARK ? "black" : "white"}}/>
        {dates.map((date) => <TableCell align="center" sx={daySx(date, true, false)}
                                        key={`table-head-${date.index}`}>
            {formatDate(date)}
        </TableCell>)}
        <TableCell align="right" sx={{width: 120, minWidth: 120}}>{t('common:total')}</TableCell>
    </TableRow>
}