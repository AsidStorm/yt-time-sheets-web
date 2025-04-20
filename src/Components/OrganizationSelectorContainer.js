import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import CopyrightCard from "./CopyrightCard";
import DonateCard from "./DonateCard";
import React from "react";
import {pushAnalytics} from "../helpers";
import {get} from "../requests";
import {AUTHORIZED_STATE_DONE} from "../constants";
import {useTranslation} from "react-i18next";

export function OrganizationSelectorContainer({ showError, defaultOrgId, setAuthorized, setFilterDialogState, exit }) {
    const { t, i18n } = useTranslation();
    const onOrgSubmit = e => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        const orgId = data.get("orgId").trim();

        if( orgId === "" ) {
            return showError("Введите ID Организации");
        }

        pushAnalytics('orgApplied');

        // Делаем запросы

        get("/api/v1/ping", orgId)
            .then( (response) => {
                if( response.data === "HAVE_ACCESS" ) {
                    localStorage.setItem("orgId", orgId);
                    setFilterDialogState(true);
                    setAuthorized(AUTHORIZED_STATE_DONE);
                } else {
                    //localStorage.removeItem("orgId");
                    showError("Не удалось авторизоваться. Проверьте данные.");
                }
            }).catch(() => {
            //localStorage.removeItem("orgId");
                showError("Не удалось авторизоваться. Проверьте данные.");
            });
    };

    return <form onSubmit={onOrgSubmit}>
        <Grid container spacing={2}>
            <Grid size={{xs: 12, sm: 6, md: 4, lg: 4, xl: 4}} offset={{xs: 0, sm: 3, md: 4, lg: 4, xl: 4}}>
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
            <Grid size={{xs: 12, sm: 6, md: 6, lg: 6, xl: 6}} offset={{xs: 0, sm: 3, md: 3, lg: 3, xl: 3}}>
                Чтобы узнать идентификатор организации, перейдите на <Link href="https://tracker.yandex.ru/settings"
                                                                           target="_blank" rel="nofollow noreferer">страницу настроек
                Tracker</Link> или в <Link href="https://org.cloud.yandex.ru/settings" target="_blank"  rel="nofollow noreferer">настройки Cloud
                организации</Link>. Идентификатор указан в поле <strong>ID организации для API</strong>.
            </Grid>
            <Grid size={{xs: 12, sm: 8, md: 4, lg: 4, xl: 2}} offset={{xs: 0, sm: 2, md: 2, lg: 2, xl: 4}}>
                <Button fullWidth type="submit">{t('common:button.continue')}</Button>
            </Grid>
            <Grid size={{xs: 12, sm: 8, md: 4, lg: 4, xl: 2}} offset={{xs: 0, sm: 2, md: 0, lg: 0, xl: 0}}>
                <Button fullWidth onClick={() => exit()}>{t('common:button.cancel')}</Button>
            </Grid>
            <Grid size={{xs: 12, sm: 8, md: 6, lg: 4, xl: 3}} offset={{xs: 0, sm: 2, md: 0, lg: 2, xl: 3}}>
                <CopyrightCard/>
            </Grid>
            <Grid size={{xs: 12, sm: 8, md: 6, lg: 4, xl: 3}} offset={{xs: 0, sm: 2, md: 0}}>
                <DonateCard/>
            </Grid>
        </Grid>
    </form>
}