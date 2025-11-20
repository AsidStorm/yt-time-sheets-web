import React, {Fragment, useState} from "react";
import {Checkbox, FormControlLabel, FormGroup, Grid} from "@mui/material";
import {useTranslation} from "react-i18next";
import {MovedToStatusesFilter} from "./MovedToStatuses";
import {DatesFilter} from "./Dates";
import {FILTER_DATE_MODE_STATUSES, FILTER_FIELD_DATES_MODE, FILTER_DATE_MODE_DATES} from "../../../constants";
import {useAtom, useAtomValue} from "jotai";
import {queryLanguageAtom, selectedIssuesMovedToStatus} from "../../../jotai/atoms";

export function IssuesMovedToStatusFilter() {
    const {t} = useTranslation();

    const queryLanguage = useAtomValue(queryLanguageAtom);
    const [issuesMovedToStatus, setIssuesMovedToStatus] = useAtom(selectedIssuesMovedToStatus);

    return <Fragment>
        {!queryLanguage && <Grid size={{xs: 12}}>
            <FormGroup>
                <FormControlLabel control={<Checkbox/>} label={t('filter:issues_moved_to_status.label')}
                                  checked={issuesMovedToStatus}
                                  onChange={(e) => setIssuesMovedToStatus(e.target.checked)}/>
            </FormGroup>
        </Grid>}

        {(issuesMovedToStatus && !queryLanguage) && <MovedToStatusesFilter />}
        {(!issuesMovedToStatus || queryLanguage) && <DatesFilter />}

        <input type="hidden" name={FILTER_FIELD_DATES_MODE} value={issuesMovedToStatus ? FILTER_DATE_MODE_STATUSES : FILTER_DATE_MODE_DATES} />
    </Fragment>
}