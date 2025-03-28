import Dialog from "@mui/material/Dialog";
import React from "react";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid2";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import {post} from "../requests";

function InitialConfigDialog({state, handleClose, startLoading, endLoading, handleComplete, showError}) {
    const handleSubmit = (e) => {
        e.preventDefault();

        startLoading();

        const data = new FormData(e.currentTarget);

        const request = {
            OAuthClientId: data.get("oauth_client_id").trim(),
            organizationId: data.get("organization_id").trim(),
            federationId: data.get("federation_id").trim(),
            allowManualInput: data.get("allow_manual_input") === "y"
        };

        post("/api/v1/config", request).then( () => {
            handleComplete();
        }).catch( showError ).finally( endLoading );
    };

    return <Dialog onClose={handleClose} open={state} fullScreen>
        <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
                <Typography sx={{ flex: 1 }} variant="h6" component="div">
                    Первичная настройка
                </Typography>
            </Toolbar>
        </AppBar>

        <form onSubmit={(e) => handleSubmit(e)}>
        <Container component="main" sx={{mt: 2, mb: 2}} maxWidth={false}>
            <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 6}}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="ID Организации"
                        fullWidth
                        name="organization_id"
                        variant="standard"
                    />
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <Alert severity="info">Вы можете найти ID организации в настройках Яндекс.Трекера.<br />Перейти в <Link href="https://tracker.yandex.ru/settings" target="_blank">настройки Яндекс.Трекера</Link> или в <Link href="https://org.cloud.yandex.ru/settings" target="_blank">настройки Cloud организации</Link>.</Alert>
                </Grid>
                <Grid size={{xs: 12}}>
                    <Divider />
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="ID Федерации (Если используете SSO)"
                        fullWidth
                        name="federation_id"
                        variant="standard"
                    />
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <Alert severity="info">Если в вашей организации для входа используется SSO, заполните это поле, что бы не вставлять его каждый раз при входе.<br />На странице списка федераций, выберите необходимую и скопируйте её идентификатор в это поле.<br /><Link href="https://org.cloud.yandex.ru/federations" target="_blank">Перейти в список федераций</Link>.</Alert>
                </Grid>
                <Grid size={{xs: 12}}>
                    <Divider />
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="OAuth Client Id (Если используете вход через Яндекс)"
                        fullWidth
                        name="oauth_client_id"
                        variant="standard"
                    />
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <Alert severity="info">Для входа с использованием Яндекс.ID необходимо подготовить OAuth Client.<br />Создайте приложение, со следующими правами:<ul>
                        <li>API Яндекс ID<ul>
                            <li>Доступ к портрету пользователя</li>
                            <li>Доступ к адресу электронной почты</li>
                            <li>Доступ к логину, имени и фамилии, полу</li>
                        </ul></li>
                        <li>Яндекс.Облако<ul>
                            <li>Аутентификация в Облаке</li>
                        </ul></li>
                        <li>Яндекс 360 Directory API<ul>
                            <li>Чтение данных о группах</li>
                        </ul></li>
                        <li>Трекер<ul>
                            <li>Чтение из трекера</li>
                            <li>Запись в трекер</li>
                        </ul></li>
                    </ul>В качестве Callback URI, укажите главную страницу данного приложения.<br /><Link href="https://oauth.yandex.ru/" target="_blank">Перейти к созданию приложения</Link>.</Alert>
                </Grid>
                <Grid size={{xs: 12}}>
                    <Divider />
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox name="allow_manual_input" value="y" />} label="Разрешить выбирать ID федерации и организации при авторизации" />
                    </FormGroup>
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <Alert severity="info">Необходимо для работы одного инстанса на несколько организаций или авторизаций. В таком случае поля при павторизации будут предзаполнены, и их можно будет поменять вручную.</Alert>
                </Grid>
                <Grid size={{xs: 12}}>
                    <Divider />
                </Grid>
                <Grid size={{xs: 4}} offset={{xs: 4}}>
                    <Button fullWidth type="submit">Завершить настройку</Button>
                </Grid>
            </Grid>
        </Container>
        </form>
    </Dialog>
}

export default InitialConfigDialog;