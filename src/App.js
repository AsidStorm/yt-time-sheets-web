import React, {useEffect, useMemo, useState} from "react";
import moment from "moment";
import createTheme from "@mui/material/styles/createTheme";
import CssBaseline from "@mui/material/CssBaseline";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import {get} from "./requests";
import FilterDialog from "./Components/FilterDialog";
import Loader from "./Components/Loader";
import Message from "./Components/Message";
import ResultTable from "./Components/ResultTable";
import {
    AUTHORIZED_STATE_DONE, AUTHORIZED_STATE_NO_ORG_ID,
    AUTHORIZED_STATE_NONE, DATE_FORMAT_DATE, RESULT_GROUP_ISSUE,
    RESULT_GROUP_NONE,
    TIME_FORMAT_HOURS
} from "./constants";
import Link from "@mui/material/Link";
import YandexId from "./yandex-id-big.svg"
import TextField from "@mui/material/TextField";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import IconButton from "@mui/material/IconButton";
import SsoDialog from "./Components/SsoDialog";
import InitialConfigDialog from "./Components/InitialConfigDialog";
import './App.css';
import {orgIdOwner, pushAnalytics} from "./helpers";
import ChangelogDialog from "./Components/ChangelogDialog";

function App() {
    const [users, setUsers] = useState([]);
    const [queues, setQueues] = useState([]);
    const [groups, setGroups] = useState([]);
    const [boards, setBoards] = useState([]);
    const [issueTypes, setIssueTypes] = useState([]);
    const [userIdentities, setUserIdentities] = useState([]);
    const [dateFormat, setDateFormat] = useState(DATE_FORMAT_DATE);
    const [projects, setProjects] = useState([]);
    const [ issueStatuses, setIssueStatuses ] = useState([]);

    const [filtered, setFiltered] = useState(false);
    const [reload, setReload] = useState(false);
    const [hideDetails, setHideDetails] = useState(false);

    const [readOnly, setReadOnly] = useState(true);
    const [admin, setAdmin] = useState(false);

    const [highlightTime, setHighlightTime] = useState(moment());

    const [ssoDialog, setSsoDialog] = useState({
        open: false
    });

    const [ colorMode, setColorMode ] = useState(false);

    const [authorized, setAuthorized] = useState(AUTHORIZED_STATE_NONE);

    const [me, setMe] = useState({
        id: 0,
        display: ""
    });

    const [ messageState, setMessageState ] = useState({
        open: false,
        message: "",
        type: "info" // error, warning, info, success
    });

    const [ filterDialogState, setFilterDialogState ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const [ loadingValue, setLoadingValue ] = useState(-1);

    const [ workLogs, setWorkLogs ] = useState([]);
    const [ dates, setDates ] = useState([]);

    const [timeFormat, setTimeFormat] = useState(TIME_FORMAT_HOURS);
    const [resultGroups, setResultGroups] = useState([RESULT_GROUP_ISSUE, RESULT_GROUP_NONE]);

    const [OAuthClientId, setOAuthClientId] = useState("");

    const [ initialConfigDialogState, setInitialConfigDialogState ] = useState(false);

    const [allowManualInput, setAllowManualInput] = useState(false);
    const [defaultOrgId, setDefaultOrgId] = useState("");
    const [federationId, setFederationId] = useState("");

    const boot = () => {
        startLoading();

        get("/api/v1/config")
            .then( data => {
                // Здесь мы получаем данные.

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
                            setMe(me);
                            setReadOnly(!me.hasLicense);
                            setAdmin(me.isAdministrator);

                            setBoards(boards.map(board => ({
                                value: board.id,
                                label: `[${board.id}]: ${board.attributes.name}`
                            })));

                            setIssueStatuses(issueStatuses.map( status => ({
                                value: status.key,
                                label: `[${status.key}] ${status.name}`
                            })));

                            setIssueTypes(issueTypes.map(type => ({
                                value: type.id,
                                label: `[${type.key}] ${type.name}`
                            })));

                            setUsers(users.map(user => ({
                                value: user.id,
                                label: user.display ? `${user.display}, ${user.email}` : user.email,
                                email: user.email
                            })));

                            setProjects(projects.map(project => ({
                                value: project.id,
                                label: project.name
                            })));

                            setQueues(queues.map(queue => ({
                                value: queue.id,
                                label: `${queue.id}: ${queue.attributes.name}`,
                                title: queue.attributes.name
                            })));

                            setGroups(groups.map(group => ({
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

    const startLoading = () => setLoading(true);
    const endLoading = () => {
        setLoadingValue(-1);
        setLoading(false);
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

    const onFilterApply = ({dates, hideDetails, dateFormat, workLogs, timeFormat, resultGroups, userIdentities, highlightTime}) => {
        setWorkLogs(workLogs);
        setDates(dates);
        setTimeFormat(timeFormat);
        setResultGroups(resultGroups);
        setUserIdentities(userIdentities);
        setHideDetails(hideDetails);

        setDateFormat(dateFormat);

        setHighlightTime(highlightTime);

        setFiltered(true);
        setReload(false);

        setFilterDialogState(false); // Закрываем диалоговое окно
    };

    const haveDataToDisplay = () => {
        if( workLogs.length > 0 ) {
            return true;
        }

        return false;
    };

    const redirectToYandexOAuth = () => {
        window.location.href = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${OAuthClientId}`
    };

    const onOrgSubmit = e => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        const orgId = data.get("orgId").trim();

        if( orgId === "" ) {
            return showError("Введите ID Организации");
        }

        pushAnalytics('orgApplied', {
            owner: orgIdOwner(orgId)
        });

        // Делаем запросы

        get("/api/v1/ping", orgId)
            .then( (response) => {
                if( response.data === "HAVE_ACCESS" ) {
                    localStorage.setItem("orgId", orgId);
                    setFilterDialogState(true);
                    setAuthorized(AUTHORIZED_STATE_DONE);
                } else {
                    localStorage.removeItem("orgId");
                    showError("Не удалось авторизоваться. Проверьте данные.");
                }
            }).catch(() => {
                localStorage.removeItem("orgId");
                showError("Не удалось авторизоваться. Проверьте данные.");
            });
    };

    const exit = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("iAmToken");

        if( allowManualInput ) {
            localStorage.removeItem("orgId");
        }

        setAuthorized(AUTHORIZED_STATE_NONE);

        showSuccess("Вы успешно вышли. Не забудьте отозвать токен, т.к. для этого нет API.");
    };

    const handleIAmToken = (iAmToken) => {
        localStorage.setItem("iAmToken", iAmToken);

        if( !allowManualInput && defaultOrgId !== "" ) {
            setAuthorized(AUTHORIZED_STATE_DONE);
        } else {
            setAuthorized(AUTHORIZED_STATE_NO_ORG_ID);
        }

        setSsoDialog(prev => ({
            ...prev,
            open: false
        }));
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
        <CssBaseline/>

        <Loader state={loading} value={loadingValue} />

        <Message state={messageState.open} message={messageState.message} type={messageState.type} handleClose={() => setMessageState(prev => ({...prev, open: false}))} />

        <InitialConfigDialog state={initialConfigDialogState} handleClose={() => setInitialConfigDialogState(false)} startLoading={startLoading} endLoading={endLoading} showError={showError} handleComplete={handleInitialConfigComplete} />

        <FilterDialog
            setLoadingValue={setLoadingValue}
            handleClose={() => setFilterDialogState(false)}
            state={filterDialogState}
            users={users}
            issueTypes={issueTypes}
            issueStatuses={issueStatuses}
            groups={groups}
            queues={queues}
            startLoading={startLoading}
            endLoading={endLoading}
            showError={showError}
            onApply={onFilterApply}
            myUserIdentity={me.id}
            projects={projects}
            reload={reload}
        />

        <SsoDialog
            showError={showError}
            state={ssoDialog.open}
            handleClose={() => setSsoDialog(prev => ({...prev, open: false}))}
            handleIAmToken={handleIAmToken}
            federationId={federationId}
            allowManualInput={allowManualInput}
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
                    <Typography variant="h6" color="inherit" noWrap sx={{flexGrow: 1, display: {xs: 'none', md: 'block'}}}>
                        {/*<IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
                            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>*/}

                        Добро пожаловать, {me.display}
                    </Typography>
                    <nav>
                        {filtered && <Link
                            variant="button"
                            color="text.primary"
                            href="#"
                            onClick={() => { setReload(true); pushAnalytics('reloadButtonClick'); }}
                            sx={{ my: 1, mx: 1.5 }}
                        >
                            Обновить
                        </Link>}
                        <Link
                            variant="button"
                            color="text.primary"
                            href="#"
                            onClick={() => {setFilterDialogState(true); pushAnalytics('filterButtonClick'); }}
                            sx={{ my: 1, mx: 1.5 }}
                        >
                            Фильтр
                        </Link>
                        <Link
                            variant="button"
                            color="text.primary"
                            href="#"
                            onClick={() => { exit(); pushAnalytics('exitButtonClick') }}
                            sx={{ my: 1, mx: 1.5 }}
                        >
                            Выход
                        </Link>
                    </nav>
                </Toolbar>
            </AppBar>}
            <Container component="main" sx={{mt: 2, mb: 2}} maxWidth={false}>
                {authorized === AUTHORIZED_STATE_DONE && <Grid container spacing={2}>
                    <Grid item xs={12}>
                        {!haveDataToDisplay() && <div>Недостаточно данных для построения аналитики, используйте <Link href="#" onClick={() => setFilterDialogState(true)}>фильтр</Link></div>}
                        {haveDataToDisplay() && <ResultTable
                            hideDetails={hideDetails}
                            dateFormat={dateFormat}
                            queues={queues}
                            userIdentities={userIdentities}
                            boards={boards}
                            workLogs={workLogs}
                            dates={dates}
                            timeFormat={timeFormat}
                            myUserIdentity={me.id}
                            users={users}
                            showError={showError}
                            showSuccess={showSuccess}
                            startLoading={startLoading}
                            endLoading={endLoading}
                            resultGroups={resultGroups}
                            setWorkLogs={setWorkLogs}
                            readOnly={readOnly}
                            admin={admin}
                            highlightTime={highlightTime}
                        />
                        }
                    </Grid>
                </Grid>}
                {authorized === AUTHORIZED_STATE_NONE && <Grid container spacing={2} direction="column"
                                      alignItems="center"
                                      justifyContent="center">
                    {OAuthClientId !== '' && <Grid item xs={4}>
                        <img src={YandexId} style={{cursor: "pointer"}} onClick={() => { pushAnalytics('yandexButtonClick'); redirectToYandexOAuth(); }} />
                    </Grid>}
                    <Grid item xs={4}>
                        <Button onClick={() => { setSsoDialog(prev => ({...prev, open: true})); pushAnalytics('ssoButtonClick'); }}>
                            Войти с помощью SSO
                        </Button>
                    </Grid>
                </Grid>}
                {authorized === AUTHORIZED_STATE_NO_ORG_ID && <form onSubmit={onOrgSubmit}><Grid container spacing={2}>
                    <Grid item xs={0} md={4} />
                    <Grid item xs={12} md={4}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="ID организации"
                            fullWidth
                            name="orgId"
                            variant="standard"
                            defaultValue={defaultOrgId}
                        />
                    </Grid>
                    <Grid item xs={0} md={4} />
                    <Grid item xs={0} md={3} />
                    <Grid item xs={12} md={6}>
                        Чтобы узнать идентификатор организации, перейдите на <Link href="https://tracker.yandex.ru/settings" target="_blank">страницу настроек Tracker</Link> или в <Link href="https://org.cloud.yandex.ru/settings" target="_blank">настройки Cloud организации</Link>. Идентификатор указан в поле <strong>ID организации для API</strong>.
                    </Grid>
                    <Grid item xs={0} md={3} />
                    <Grid item xs={0} md={4} />
                    <Grid item xs={12} md={4}>
                        <Button fullWidth type="submit">Продолжить</Button>
                    </Grid>
                    <Grid item xs={0} md={4} />
                    <Grid item xs={0} md={4} />
                    <Grid item xs={12} md={4}>
                        <Button fullWidth onClick={() => exit()}>Отменить</Button>
                    </Grid>
                </Grid></form>}
            </Container>
        </Box>
    </ThemeProvider>
}

export default App;
