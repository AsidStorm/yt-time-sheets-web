import React, {useState} from "react";
import {Trans, useTranslation} from "react-i18next";
import {DialogTitle, Dialog, DialogContent, Grid, Button, Link, TextField} from "@mui/material";
import {useMessage} from "../hooks";

function SsoDialog({state, handleClose, handleIAmToken, federationId, allowManualInput}) {
    const {t} = useTranslation();
    const {showError} = useMessage();

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

        if (!callbackUrl) {
            if (!federationId) {
                return showError(t('notifications:setup_federation_id'));
            }

            window.open(`https://console.cloud.yandex.ru/federations/${federationId}?redirectUrl=http://127.0.0.1:61759`, '_blank', 'width=800,height=600');

            return;
        }

        if (callbackUrl.indexOf("http://") < 0 || callbackUrl.indexOf("https://") < 0) {
            callbackUrl = `http://${callbackUrl}`;
        }

        const url = new URL(callbackUrl);
        const params = Object.fromEntries((new URLSearchParams(url.search)).entries());

        if (params.token) {
            handleIAmToken(params.token);
        }
    };

    return <Dialog onClose={handleClose} open={state} maxWidth="md" fullWidth>
        <DialogTitle>{t('components:sso_dialog.title')}</DialogTitle>
        <DialogContent>
            <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 6}}>
                    <Button fullWidth onClick={() => setMode("STANDARD")}>
                        {t('components:sso_dialog.mode.standard')}
                    </Button>
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <Button fullWidth onClick={() => setMode("HACK")}>
                        {t('components:sso_dialog.mode.web')}
                    </Button>
                </Grid>
                {mode === "STANDARD" && <Grid size={{xs: 12}}>
                    <form onSubmit={handleStandardAuthSubmit}>
                        <Grid container spacing={2}>
                            <Grid size={{xs: 12}}>
                                <Trans
                                    i18nKey='components:sso_dialog.mode.standard.description_row_1'
                                    components={{
                                        instruction: <Link
                                            href="https://cloud.yandex.ru/docs/cli/operations/authentication/federated-user"
                                            target="_blank" rel="nofollow noopener"/>
                                    }}
                                />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                {t('components:sso_dialog.mode.standard.description_row_2')}
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label={t('components:sso_dialog.fields.i_am_token.label')}
                                    fullWidth
                                    name="iAmToken"
                                    variant="standard"
                                />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <Button type="submit" fullWidth>
                                    {t('common:button.authorize')}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>}

                {mode === "HACK" && <Grid size={{xs: 12}}>
                    <form onSubmit={handleHackAuthSubmit}>
                        <Grid container spacing={2}>
                            <Grid size={{xs: 12}}>
                                {t('components:sso_dialog.mode.web.description_row_1')}
                            </Grid>
                            <Grid size={{xs: 12}}>
                                {t('components:sso_dialog.mode.web.description_row_2')}
                            </Grid>
                            <Grid size={{xs: 12}}>
                                {t('components:sso_dialog.mode.web.description_row_3')}
                            </Grid>
                            {(allowManualInput || federationId === "") && <Grid size={{xs: 12}}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label={t('components:sso_dialog.fields.federation_id.label')}
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
                                    label={t('components:sso_dialog.fields.federation_id.label')}
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
                                    {t('common:button.open_in_new_window')}
                                </Button>
                            </Grid>
                            <Grid size={{xs: 12}}>
                                {t('components:sso_dialog.mode.web.description_row_4')}
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <TextField
                                    margin="dense"
                                    label={t('components:sso_dialog.fields.callback_url.label')}
                                    fullWidth
                                    name="callbackUrl"
                                    variant="standard"
                                />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <Button type="submit" fullWidth>
                                    {t('common:button.authorize')}
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