import React from "react";
import {
    Dialog,
    Toolbar,
    Typography,
    Button,
    AppBar,
    Grid2 as Grid,
    Container,
    TextField,
    FormGroup,
    Checkbox,
    FormControlLabel,
    Divider,
    Alert,
    Link
} from "@mui/material";
import {post} from "../requests";
import {Trans, useTranslation} from "react-i18next";
import {useLoader, useMessage} from "../hooks";

function InitialConfigDialog({state, handleClose, handleComplete}) {
    const {t, i18n} = useTranslation();

    const { startLoading, endLoading } = useLoader();
    const { showError } = useMessage();

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

        post("/api/v1/config", request).then(() => {
            handleComplete();
        }).catch(showError).finally(endLoading);
    };

    return <Dialog onClose={handleClose} open={state} fullScreen>
        <AppBar sx={{position: 'relative'}}>
            <Toolbar>
                <Typography sx={{flex: 1}} variant="h6" component="div">
                    {t('components:initial_config_dialog.title')}
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
                            label={t('components:initial_config_dialog.fields.organization_id.label')}
                            fullWidth
                            name="organization_id"
                            variant="standard"
                        />
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <Alert severity="info">
                            {t('components:initial_config_dialog.fields.organization_id.description_row_1')}<br/>
                            <Trans
                                i18nKey='components:initial_config_dialog.fields.organization_id.description_row_2'
                                components={{
                                    trackerSettings: <Link href="https://tracker.yandex.ru/settings" target="_blank" rel="nofollow noopener" />,
                                    cloudSettings: <Link href="https://org.cloud.yandex.ru/settings" target="_blank" rel="nofollow noopener" />
                                }}
                            />
                        </Alert>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <Divider/>
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label={t('components:initial_config_dialog.fields.federation_id.label')}
                            fullWidth
                            name="federation_id"
                            variant="standard"
                        />
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <Alert severity="info">
                            {t('components:initial_config_dialog.fields.federation_id.description_row_1')}<br />
                            {t('components:initial_config_dialog.fields.federation_id.description_row_2')}<br />
                            <Trans
                                i18nKey='components:initial_config_dialog.fields.federation_id.description_row_3'
                                components={{
                                    cloudFederations: <Link href="https://org.cloud.yandex.ru/federations" target="_blank" rel="nofollow noopener" />
                                }}
                            />
                        </Alert>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <Divider/>
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label={t('components:initial_config_dialog.fields.oauth_client_id.label')}
                            fullWidth
                            name="oauth_client_id"
                            variant="standard"
                        />
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <Alert severity="info">
                            {t('components:initial_config_dialog.fields.oauth_client_id.description_row_1')}<br/>
                            {t('components:initial_config_dialog.fields.oauth_client_id.description_row_2')}
                            <ul>
                                <li>{t('components:initial_config_dialog.fields.oauth_client_id.access.yandex_id.label')}
                                    <ul>
                                        <li>{t('components:initial_config_dialog.fields.oauth_client_id.access.yandex_id.items.avatar')}</li>
                                        <li>{t('components:initial_config_dialog.fields.oauth_client_id.access.yandex_id.items.email')}</li>
                                        <li>{t('components:initial_config_dialog.fields.oauth_client_id.access.yandex_id.items.base')}</li>
                                    </ul>
                                </li>
                                <li>{t('components:initial_config_dialog.fields.oauth_client_id.access.yandex_cloud.label')}
                                    <ul>
                                        <li>{t('components:initial_config_dialog.fields.oauth_client_id.access.yandex_cloud.items.authorize')}</li>
                                    </ul>
                                </li>
                                <li>{t('components:initial_config_dialog.fields.oauth_client_id.access.yandex_360.label')}
                                    <ul>
                                        <li>{t('components:initial_config_dialog.fields.oauth_client_id.access.yandex_360.items.groups')}</li>
                                    </ul>
                                </li>
                                <li>{t('components:initial_config_dialog.fields.oauth_client_id.access.yandex_tracker.label')}
                                    <ul>
                                        <li>{t('components:initial_config_dialog.fields.oauth_client_id.access.yandex_tracker.items.read')}</li>
                                        <li>{t('components:initial_config_dialog.fields.oauth_client_id.access.yandex_tracker.items.write')}</li>
                                    </ul>
                                </li>
                            </ul>
                            {t('components:initial_config_dialog.fields.oauth_client_id.description_row_3')}<br/>
                            <Trans
                                i18nKey='components:initial_config_dialog.fields.oauth_client_id.description_row_4'
                                components={{
                                    yandexOauth: <Link href="https://oauth.yandex.ru/" target="_blank" rel="nofollow noopener" />
                                }}
                            />
                        </Alert>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <Divider/>
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox name="allow_manual_input" value="y"/>}
                                              label={t('components:initial_config_dialog.fields.allow_manual_input.label')}/>
                        </FormGroup>
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <Alert severity="info">
                            {t('components:initial_config_dialog.fields.allow_manual_input.description')}
                        </Alert>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <Divider/>
                    </Grid>
                    <Grid size={{xs: 4}} offset={{xs: 4}}>
                        <Button fullWidth type="submit">{t('common:button.finish_setup')}</Button>
                    </Grid>
                </Grid>
            </Container>
        </form>
    </Dialog>
}

export default InitialConfigDialog;