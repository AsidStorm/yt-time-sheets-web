import React from "react";
import {Link} from "@mui/material";
import {RESULT_GROUP_EPIC, RESULT_GROUP_ISSUE, RESULT_GROUP_PROJECT, RESULT_GROUP_QUEUE} from "../../constants";
import {yandexTrackerIssueUrl, yandexTrackerProjectUrl, yandexTrackerQueueUrl} from "../../helpers";

export function RowTooltipTitle({row}) {
    if (row.parameters) {
        const {resultGroup, key} = row.parameters;

        if (resultGroup === RESULT_GROUP_ISSUE || resultGroup === RESULT_GROUP_EPIC) {
            if (key === "") {
                return <span>{row.title}</span>
            }

            return <Link href={yandexTrackerIssueUrl(key)} target="_blank">{row.title}</Link>
        }

        if (resultGroup === RESULT_GROUP_PROJECT) {
            if (key === "") {
                return <span>{row.title}</span>
            }

            return <Link href={yandexTrackerProjectUrl(key)} target="_blank">{row.title}</Link>
        }

        if (resultGroup === RESULT_GROUP_QUEUE) {
            return <Link href={yandexTrackerQueueUrl(key)} target="_blank">{row.title}</Link>
        }
    }

    return <span>{row.title}</span>
}