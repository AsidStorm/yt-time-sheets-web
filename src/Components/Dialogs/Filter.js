import React, {Fragment, useEffect, useState} from "react";
import {
    Slide, Dialog, Toolbar, IconButton, Typography, FormControlLabel, Switch, Button, AppBar, Container, Grid
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {useTranslation} from "react-i18next";
import {useAtom, useAtomValue, useSetAtom} from "jotai";
import {filterValuesAtom, queryLanguageAtom, selectedQueryAtom} from "../../jotai/atoms";
import {UsersFilter} from "./Filter/Users";
import {QueryFilter} from "./Filter/Query";
import {QueuesFilter} from "./Filter/Queues";
import {ProjectsFilter} from "./Filter/Projects";
import {IssueTypesFilter} from "./Filter/IssueTypes";
import {TimeFormatFilter} from "./Filter/TimeFormat";
import {ResultGroupsFilter} from "./Filter/ResultGroups";
import {IssuesMovedToStatusFilter} from "./Filter/IssuesMovedToStatus";
import {
    DATE_FORMAT, DATE_FORMAT_DATE,
    DATE_FORMAT_MONTH,
    FILTER_DATE_MODE_STATUSES, FILTER_FIELD_DATE_FORMAT,
    FILTER_FIELD_DATE_FROM, FILTER_FIELD_DATE_TO,
    FILTER_FIELD_DATES_MODE, FILTER_FIELD_HIDE_DETAILS, FILTER_FIELD_HIGHLIGHT_TIME, FILTER_FIELD_ISSUE_STATUSES,
    FILTER_FIELD_ISSUE_TYPES, FILTER_FIELD_MOVED_TO_STATUS_DATE,
    FILTER_FIELD_MOVED_TO_STATUS_MONTH, FILTER_FIELD_MOVED_TO_STATUS_YEAR, FILTER_FIELD_PROJECTS,
    FILTER_FIELD_QUERY,
    FILTER_FIELD_QUEUES, FILTER_FIELD_RESULT_GROUPS, FILTER_FIELD_SHOULD_OPTIMIZE,
    FILTER_FIELD_TIME_FORMAT,
    FILTER_FIELD_USERS, RESULT_GROUP_WORKER
} from "../../constants";
import {useFilterRequest, useFilterResult, useLoader, useMessage} from "../../hooks";
import {post} from "../../requests";
import {generateMoments, pushAnalytics, sleep, sliceIntoChunks} from "../../helpers";
import moment from "moment";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function FilterHeader({ handleClose }) {
    const {t} = useTranslation();

    const [queryLanguage, setQueryLanguage] = useAtom(queryLanguageAtom);

    return <AppBar sx={{position: 'relative'}}>
        <Toolbar>
            <IconButton
                edge="start"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
            >
                <CloseIcon/>
            </IconButton>
            <Typography sx={{ml: 2, flex: 1}} variant="h6" component="div">
                {t('filter:header')}
                <FormControlLabel control={<Switch checked={queryLanguage} onChange={(e) => setQueryLanguage(e.target.checked)} color="warning" />} sx={{ml: 5}} label={t('common:button.query_language')} />
            </Typography>
            <Button type="submit" color="inherit">
                {t('common:button.apply')}
            </Button>
        </Toolbar>
    </AppBar>
}

function FilterBodyQuery() {
    return <QueryFilter />
}

function FilterBodyAll() {
    return <Fragment>
        <QueuesFilter />
        <IssueTypesFilter />
        <ProjectsFilter />
    </Fragment>
}

function FilterBody() {
    const {t} = useTranslation();

    const queryLanguage = useAtomValue(queryLanguageAtom);

    return <Grid container spacing={2} sx={{pt:1}}>
            <UsersFilter />

            {queryLanguage && <FilterBodyQuery />}
            {!queryLanguage && <FilterBodyAll />}

            <IssuesMovedToStatusFilter />
            <TimeFormatFilter />
            <ResultGroupsFilter />

            <Grid size={{xs: 12, sm: 6}} offset={{sm: 3}}>
                <Button type="submit" fullWidth variant="outlined">{t('common:button.apply')}</Button>
            </Grid>
    </Grid>
}

export function FilterDialog({handleClose, state, onApply}) {
    const { doRequest } = useFilterRequest();

    const handleFormSubmit = e => {
        e.preventDefault();

        const formData = new FormData(e.target);
        doRequest(formData).then( onApply );
    }

    return <Dialog
        fullScreen
        open={state}
        onClose={handleClose}
        slots={{
            transition: Transition,
        }}
    >
        <form name="filter" onSubmit={handleFormSubmit}>
            <FilterHeader handleClose={handleClose} />

            <Container component="main" sx={{mt: 2, mb: 2}} maxWidth={false}>
                <FilterBody />
            </Container>
        </form>
    </Dialog>
}