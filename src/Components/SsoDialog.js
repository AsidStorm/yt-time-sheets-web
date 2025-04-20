import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import React, {useState} from "react";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import {Trans} from "react-i18next";

function SsoDialog({ state, handleClose, handleIAmToken, showError, federationId, allowManualInput }) {
    const [mode, setMode] = useState("NONE");

    const handleStandardAuthSubmit = (e) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        handleIAmToken(data.get("iAmToken"))
    };

    const handleHackAuthSubmit = (e) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        const federationId = data.get("federationId") || "";
        let callbackUrl = data.get("callbackUrl") || "";

        if( !callbackUrl ) {
            if( !federationId ) {
                return showError("Укажите ID федерации");
            }

            window.open(`https://console.cloud.yandex.ru/federations/${federationId}?redirectUrl=http://127.0.0.1:61759`, '_blank', 'width=800,height=600');

            return;
        }

        if( callbackUrl.indexOf("http://") < 0 || callbackUrl.indexOf("https://") < 0 ) {
            callbackUrl = `http://${callbackUrl}`;
        }

        const url = new URL(callbackUrl);
        const params = Object.fromEntries((new URLSearchParams(url.search)).entries());

        if( params.token ) {
            handleIAmToken(params.token);
        }
    };

    return <Dialog onClose={handleClose} open={state} maxWidth="md" fullWidth>
        <DialogTitle>Авторизация через SSO</DialogTitle>
        <DialogContent>
            <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 6}}>
                    <Button fullWidth onClick={() => setMode("STANDARD")}>
                        <Trans>Стандартная</Trans>
                    </Button>
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <Button fullWidth onClick={() => setMode("HACK")}>
                        <Trans>Через WEB</Trans>
                    </Button>
                </Grid>
                {mode === "STANDARD" && <Grid size={{xs: 12}}>
                    <form onSubmit={handleStandardAuthSubmit}>
                    <Grid container spacing={2}>
                        <Grid size={{xs: 12}}>
                            Пользуясь <Link href="https://cloud.yandex.ru/docs/cli/operations/authentication/federated-user" target="_blank">инструкцией</Link> авторизуйтесь с помощью утилиты <strong>yc</strong> в своей федерации.
                        </Grid>
                        <Grid size={{xs: 12}}>
                            <Trans>Получите iAm токен, и вставьте его в поле ниже.</Trans>
                        </Grid>
                        <Grid size={{xs: 12}}>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="iAm токен"
                                fullWidth
                                name="iAmToken"
                                variant="standard"
                            />
                        </Grid>
                        <Grid size={{xs: 12}}>
                            <Button type="submit" fullWidth>
                                <Trans>Авторизоваться</Trans>
                            </Button>
                        </Grid>
                    </Grid>
                    </form>
                </Grid>}
                {mode === "HACK" && <Grid size={{xs: 12}}>
                    <form onSubmit={handleHackAuthSubmit}>
                        <Grid container spacing={2}>
                            <Grid size={{xs: 12}}>
                                Введите ID федерации в поле ниже, и нажмите кнопку "Открыть в новом окне".
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <Trans>Не закрывайте окно после авторизации, ссылка, на которую вы попали будет необходима на следующем шаге.</Trans>
                            </Grid>
                            <Grid size={{xs: 12}}>
                                Не пугайтесь ошибки "Не удается получить доступ к сайту", всё идёт по плану.
                            </Grid>
                            {(allowManualInput || federationId === "") && <Grid size={{xs: 12}}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="ID федерации"
                                    fullWidth
                                    name="federationId"
                                    variant="standard"
                                    defaultValue={federationId}
                                />
                            </Grid>}
                            {(!allowManualInput && federationId !== "") && <Grid size={{xs: 12}}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="ID федерации"
                                    fullWidth
                                    name="federationId"
                                    variant="standard"
                                    defaultValue={federationId}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                            </Grid>}
                            <Grid size={{xs: 12}}>
                                <Button type="submit" fullWidth>
                                    Открыть в новом окне
                                </Button>
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <Trans>Вставьте URL полученной страницы в поле ниже.</Trans>
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <TextField
                                    margin="dense"
                                    label="Callback URL"
                                    fullWidth
                                    name="callbackUrl"
                                    variant="standard"
                                />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <Button type="submit" fullWidth>
                                    <Trans>Авторизоваться</Trans>
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>}
            </Grid>
        </DialogContent>
    </Dialog>
}

export default SsoDialog;