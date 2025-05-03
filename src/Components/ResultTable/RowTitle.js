import React from "react";
import TableCell from "@mui/material/TableCell";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import {
    RESULT_GROUP_EPIC,
    RESULT_GROUP_ISSUE,
    RESULT_GROUP_ISSUE_TYPE, RESULT_GROUP_PROJECT,
    RESULT_GROUP_QUEUE,
    RESULT_GROUP_WORKER
} from "../../constants";
import Link from "@mui/material/Link";
import {yandexTrackerIssueUrl, yandexTrackerProjectUrl, yandexTrackerQueueUrl} from "../../helpers";
import {makeStyles} from "@mui/styles";
import {useTranslation} from "react-i18next";
import {useInsightsDialog} from "../../hooks";
import {useAtomValue} from "jotai";
import {insightsEnabledAtom} from "../../jotai/atoms";

const useStyles = makeStyles({
    table: {
        minWidth: 650
    },
    sticky: {
        position: "sticky",
        left: 0,
        borderRight: "1px solid black",
        width: 500,
        zIndex: 1,
        background: 'inherit',
    }
});

export function ResultTableRowTitle({ row }) {
    const {t} = useTranslation();

    const insightsEnabled = useAtomValue(insightsEnabledAtom);

    const { open: openInsightsDialog } = useInsightsDialog();

    const classes = useStyles();

    const { title, depth } = row;

    const prefix = `\u00A0`.repeat(depth);

    if( row.isSummary ) {
        return <TableCell className={classes.sticky} component="th" scope="row">
            {prefix}{title}
        </TableCell>
    }

    const { parameters: { resultGroup, key } } = row;

    const insights = (row) => row.isMaxDepth && insightsEnabled ? <Tooltip title={t('components:row_title.insights_tooltip')}>
        <IconButton size="small" onClick={() => { openInsightsDialog(row); }}>
            <AnalyticsIcon />
        </IconButton>
    </Tooltip> : null;

    if( resultGroup === RESULT_GROUP_ISSUE ) {
        const { extra: { epicKey, epicDisplay } } = row;

        if( epicKey !== "" ) {
            return <TableCell className={classes.sticky} component="th" scope="row">
                {insights(row)}{prefix}<Tooltip title={t('components:row_title.epic_tooltip', {epicKey, epicDisplay})}>
                <Link href={yandexTrackerIssueUrl(epicKey)} target="_blank">{epicKey}</Link>
            </Tooltip> / <Link href={yandexTrackerIssueUrl(key)} target="_blank">{title}</Link>
            </TableCell>
        }

        return <TableCell className={classes.sticky} component="th" scope="row">
            {insights(row)}{prefix}<Link href={yandexTrackerIssueUrl(key)} target="_blank">{title}</Link>
        </TableCell>
    }

    if( resultGroup === RESULT_GROUP_EPIC ) {
        if( key === "" ) {
            return <TableCell className={classes.sticky} component="th" scope="row">
                {insights(row)}{prefix}{title}
            </TableCell>
        }

        return <TableCell className={classes.sticky} component="th" scope="row">
            {insights(row)}{prefix}<Link href={yandexTrackerIssueUrl(key)} target="_blank">{title}</Link>
        </TableCell>
    }

    if (resultGroup === RESULT_GROUP_ISSUE_TYPE) {
        return <TableCell className={classes.sticky} component="th" scope="row">
            {insights(row)}{prefix}{title}
        </TableCell>
    }

    if( resultGroup === RESULT_GROUP_WORKER ) {
        return <TableCell className={classes.sticky} component="th" scope="row">
            {insights(row)}{prefix}{title}
        </TableCell>
    }

    if( resultGroup === RESULT_GROUP_QUEUE ) {
        return <TableCell className={classes.sticky} component="th" scope="row">
            {insights(row)}{prefix}<Link href={yandexTrackerQueueUrl(key)} target="_blank">{title}</Link>
        </TableCell>
    }

    if( resultGroup === RESULT_GROUP_PROJECT ) {
        if( key === "" ) {
            return <TableCell className={classes.sticky} component="th" scope="row">
                {insights(row)}{prefix}{title}
            </TableCell>
        }

        return <TableCell className={classes.sticky} component="th" scope="row">
            {insights(row)}{prefix}<Link href={yandexTrackerProjectUrl(key)} target="_blank">{title}</Link>
        </TableCell>
    }

    return <TableCell className={classes.sticky} component="th" scope="row" />
}