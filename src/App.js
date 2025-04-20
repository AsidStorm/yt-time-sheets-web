import React, {useEffect, useMemo, useState} from "react";
import moment from "moment";
import createTheme from "@mui/material/styles/createTheme";
import CssBaseline from "@mui/material/CssBaseline";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import {get} from "./requests";
import FilterDialog from "./Components/FilterDialog";
import Loader from "./Components/Loader";
import Message from "./Components/Message";
import ResultTable from "./Components/ResultTable";
import {
    AUTHORIZED_STATE_DONE, AUTHORIZED_STATE_NO_ORG_ID,
    AUTHORIZED_STATE_NONE
} from "./constants";
import Link from "@mui/material/Link";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import IconButton from "@mui/material/IconButton";
import InitialConfigDialog from "./Components/InitialConfigDialog";
import './App.css';
import {makeObjectFromArray, pushAnalytics} from "./helpers";
import ChangelogDialog from "./Components/ChangelogDialog";
import CopyrightCard from "./Components/CopyrightCard";
import DonateCard from "./Components/DonateCard";
import {Trans, useTranslation} from 'react-i18next';
import {
    usersMapAtom,
    queuesMapAtom,
    groupsMapAtom,
    projectsMapAtom,
    boardsMapAtom,
    issueTypesMapAtom,
    issueStatusesMapAtom,
    haveWorkLogsAtom, myUserAtom,
} from "./jotai/atoms";
import {InputLabel, Select, FormControl, MenuItem} from "@mui/material";
import {useAtom, useAtomValue, useSetAtom} from "jotai";
import {AuthorizeButtonsContainer} from "./Components/AuthorizeButtonsContainer";
import {OrganizationSelectorContainer} from "./Components/OrganizationSelectorContainer";
import {useLoader} from "./hooks";
import {LanguageSelector} from "./Components/LanguageSelector";

function App() {
    const { t } = useTranslation();

    const { startLoading, endLoading } = useLoader();

    const setUsersMap = useSetAtom(usersMapAtom);
    const setQueuesMap = useSetAtom(queuesMapAtom);
    const setGroupsMap = useSetAtom(groupsMapAtom);
    const setProjectsMap = useSetAtom(projectsMapAtom);
    const setBoardsMap = useSetAtom(boardsMapAtom);
    const setIssueTypesMap = useSetAtom(issueTypesMapAtom);
    const setIssueStatusesMap = useSetAtom(issueStatusesMapAtom);
    const haveDataToDisplay = useAtomValue(haveWorkLogsAtom);

    const [ myUser, setMyUser ] = useAtom(myUserAtom);

    const [filtered, setFiltered] = useState(false);
    const [reload, setReload] = useState(false);

    const [ colorMode, setColorMode ] = useState(false);

    const [authorized, setAuthorized] = useState(AUTHORIZED_STATE_NONE);

    const [ messageState, setMessageState ] = useState({
        open: false,
        message: "",
        type: "info" // error, warning, info, success
    });

    const [ filterDialogState, setFilterDialogState ] = useState(false);

    const [OAuthClientId, setOAuthClientId] = useState("");

    const [ initialConfigDialogState, setInitialConfigDialogState ] = useState(false);

    const [allowManualInput, setAllowManualInput] = useState(false);
    const [defaultOrgId, setDefaultOrgId] = useState("");
    const [federationId, setFederationId] = useState("");

    const boot = () => {
        startLoading();

        get("/api/v1/config")
            .then( data => {
                if( !data.haveConfig ) {
                    setInitialConfigDialogState(true);
                }
                else {
                    if( data.organizationId !== '' ) {
                        localStorage.setItem("orgId", data.organizationId); // У нас МОЖЕТ быть установлена организация
                        setDefaultOrgId(data.organizationId);
                    }

                    setAllowManualInput(data.allowManualInput);
                    setFederationId(data.federationId);

                    setOAuthClientId(data.OAuthClientId);

                    const token = localStorage.getItem("authToken");
                    const orgId = localStorage.getItem("orgId");
                    const iAmToken = localStorage.getItem("iAmToken");

                    if ( (token || iAmToken) && orgId && !allowManualInput ) {
                        return setAuthorized(AUTHORIZED_STATE_DONE);
                    }

                    if ( token || iAmToken ) {
                        return setAuthorized(AUTHORIZED_STATE_NO_ORG_ID);
                    }

                    if( window.location.hash ) {
                        const urlSearchParams = new URLSearchParams(window.location.hash.replace("#", "?"));
                        const params = Object.fromEntries(urlSearchParams.entries());

                        if ( params.error_description ) {
                            showError(params.error_description);
                        } else {
                            window.history.replaceState({}, document.title, "/");
                            localStorage.setItem("authToken", params.access_token);

                            if( orgId && !data.allowManualInput ) {
                                setAuthorized(AUTHORIZED_STATE_DONE);
                            } else {
                                setAuthorized(AUTHORIZED_STATE_NO_ORG_ID);
                            }

                            showSuccess("Вы успешно авторизованы");
                        }
                    }
                }
            })
            .catch(showError)
            .finally( endLoading );
    };

    const handleInitialConfigComplete= () => {
        setInitialConfigDialogState(false);
        boot();
    };

    useEffect( () => {
        boot();
    }, []);

    useEffect(() => {
        if( authorized === AUTHORIZED_STATE_DONE ) {
            startLoading();

            const fetchData = async () => {
                const [me, usersAndGroups, queues, boards, projects, issueTypes, issueStatuses] = await Promise.all([
                    get("/api/v1/me"),
                    get("/api/v1/users_and_groups"),
                    get("/api/v1/queues"),
                    get("/api/v1/boards"),
                    get("/api/v1/projects"),
                    get("/api/v1/issue_types"),
                    get("/api/v1/issue_statuses")
                ]);

                return {me: me.data, users: usersAndGroups.users, queues: queues.data, groups: usersAndGroups.groups, boards: boards.data, projects: projects.data, issueTypes: issueTypes.data, issueStatuses: issueStatuses.issueStatuses};
            };

            get("/api/v1/ping")
                .then( () => {
                    fetchData()
                        .then(({me, users, queues, groups, boards, projects, issueTypes, issueStatuses}) => {
                            setMyUser({
                                value: me.id,
                                label: me.display,
                                isAdmin: me.isAdministrator,
                                isReadOnly: !me.hasLicense
                            });

                            setBoardsMap(makeObjectFromArray(boards, board => board.id, board => ({
                                value: board.id,
                                label: `[${board.id}]: ${board.attributes.name}`
                            })));

                            setIssueStatusesMap(makeObjectFromArray(issueStatuses, status => status.key, status => ({
                                value: status.key,
                                label: `[${status.key}] ${status.name}`
                            })))

                            setIssueTypesMap(makeObjectFromArray(issueTypes, type => type.id, type => ({
                                value: type.id,
                                label: `[${type.key}] ${type.name}`
                            })));

                            setUsersMap(makeObjectFromArray(users, user => user.id, user => ({
                                value: user.id,
                                label: user.display ? `${user.display}, ${user.email}` : user.email,
                                email: user.email
                            })));

                            setProjectsMap(makeObjectFromArray(projects, project => project.id, project => ({
                                value: project.id,
                                label: project.name
                            })));

                            setQueuesMap(makeObjectFromArray(queues, queue => queue.id, queue => ({
                                value: queue.id,
                                label: `${queue.id}: ${queue.attributes.name}`,
                                title: queue.attributes.name
                            })));

                            setGroupsMap(makeObjectFromArray(groups, group => group.id, group => ({
                                value: group.id,
                                label: group.attributes.label,
                                members: group.attributes.members
                            })));

                            setFilterDialogState(true);
                        }).catch((e) => {
                            showError(e);
                            exit();
                        }).finally(endLoading);
                }).catch( () => {
                    exit();
                    endLoading();
                });
        }
    }, [authorized]);

    const toggleColorMode = () => {
        setColorMode(!colorMode);
    };

    const showError = message => {
        setMessageState({
            open: true,
            message: message instanceof Error ? message.message : message,
            type: "error"
        });
    };

    const showSuccess = message => {
        setMessageState({
            open: true,
            message: message,
            type: "success"
        });
    };

    const onFilterApply = () => {
        setFiltered(true);
        setReload(false);

        setFilterDialogState(false); // Закрываем диалоговое окно
    };

    const exit = () => {
        /*localStorage.removeItem("authToken");
        localStorage.removeItem("iAmToken");

        if( allowManualInput ) {
            localStorage.removeItem("orgId");
        }

        setAuthorized(AUTHORIZED_STATE_NONE);

        showSuccess("Вы успешно вышли. Не забудьте отозвать токен, т.к. для этого нет API.");*/
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: colorMode ? 'dark' : 'light',
                },
            }),
        [colorMode],
    );

    return <ThemeProvider theme={theme}>
        <CssBaseline />

        <Loader />

        <Message state={messageState.open} message={messageState.message} type={messageState.type} handleClose={() => setMessageState(prev => ({...prev, open: false}))} />

        <InitialConfigDialog state={initialConfigDialogState} handleClose={() => setInitialConfigDialogState(false)} startLoading={startLoading} endLoading={endLoading} showError={showError} handleComplete={handleInitialConfigComplete} />

        <FilterDialog
            handleClose={() => setFilterDialogState(false)}
            state={filterDialogState}
            showError={showError}
            onApply={onFilterApply}
            reload={reload}
        />

        <ChangelogDialog state={false} handleClose={() => {}}/>

        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}
        >
            {authorized === AUTHORIZED_STATE_DONE && <AppBar
                position="absolute"
                color="default"
                elevation={0}
                sx={{
                    position: 'relative',
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                }}
            >
                <Toolbar sx={{flexWrap: 'wrap'}}>
                    <LanguageSelector />
                    <IconButton onClick={toggleColorMode} color="inherit">
                        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                    <Typography variant="h6" color="inherit" noWrap sx={{flexGrow: 1, display: {xs: 'none', md: 'block'}}}>
                        Добро пожаловать, {myUser.label}
                    </Typography>
                    <nav>
                        {filtered && <Link
                            variant="button"
                            color="text.primary"
                            href="#"
                            onClick={() => { setReload(true); pushAnalytics('reloadButtonClick'); }}
                            sx={{ my: 1, mx: 1.5 }}
                        >
                            {t('common:button.reload')}
                        </Link>}
                        <Link
                            variant="button"
                            color="text.primary"
                            href="#"
                            onClick={() => {setFilterDialogState(true); pushAnalytics('filterButtonClick'); }}
                            sx={{ my: 1, mx: 1.5 }}
                        >
                            <Trans>Фильтр</Trans>
                        </Link>
                        <Link
                            variant="button"
                            color="text.primary"
                            href="#"
                            onClick={() => { exit(); pushAnalytics('exitButtonClick') }}
                            sx={{ my: 1, mx: 1.5 }}
                        >
                            {t('common:button.exit')}
                        </Link>
                    </nav>
                </Toolbar>
            </AppBar>}
            <Container component="main" sx={{mt: 2, mb: 2}} maxWidth={false}>
                {authorized === AUTHORIZED_STATE_DONE && <Grid container spacing={2}>
                    <Grid size={12}>
                        {!haveDataToDisplay && <div><Trans>Недостаточно данных для построения аналитики, используйте <Link href="#" onClick={() => setFilterDialogState(true)}>фильтр</Link></Trans></div>}
                        {haveDataToDisplay && <ResultTable
                            showError={showError}
                            showSuccess={showSuccess}
                        />}
                    </Grid>
                    <Grid size={{xs: 12, sm: 8, md: 6, lg: 4, xl: 3}} offset={{xs: 0, sm: 2, md: 0, lg: 2, xl: 3}}>
                        <CopyrightCard />
                    </Grid>
                    <Grid size={{xs: 12, sm: 8, md: 6, lg: 4, xl: 3}} offset={{xs:0, sm: 2, md: 0}}>
                        <DonateCard />
                    </Grid>
                </Grid>}
                {authorized === AUTHORIZED_STATE_NONE && <AuthorizeButtonsContainer OAuthClientId={OAuthClientId} allowManualInput={allowManualInput} federationId={federationId} defaultOrgId={defaultOrgId} showError={showError} setAuthorized={setAuthorized} />}
                {authorized === AUTHORIZED_STATE_NO_ORG_ID && <OrganizationSelectorContainer showError={showError} defaultOrgId={defaultOrgId} setAuthorized={setAuthorized} setFilterDialogState={setFilterDialogState} exit={exit} />}
            </Container>
        </Box>
    </ThemeProvider>
}

export default App;
