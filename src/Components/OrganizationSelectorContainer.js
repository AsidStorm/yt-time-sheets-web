import React from "react";
import {Grid, TextField, Link, Button} from "@mui/material";
import {Trans, useTranslation} from "react-i18next";
import CopyrightCard from "./CopyrightCard";
import DonateCard from "./DonateCard";
import {pushAnalytics} from "../helpers";
import {get} from "../requests";
import {AUTHORIZED_STATE_DONE} from "../constants";
import {useMessage} from "../hooks";

export function OrganizationSelectorContainer({ defaultOrgId, setAuthorized, setFilterDialogState, exit }) {
    const { t } = useTranslation();

    const { showError } = useMessage();
    const onOrgSubmit = e => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        const orgId = data.get("orgId").trim();

        if( orgId === "" ) {
            return showError(t('notifications:enter_organization_id'));
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
                    showError(t('notifications:unable_to_authorize'));
                }
            }).catch(() => {
            //localStorage.removeItem("orgId");
                showError(t('notifications:unable_to_authorize'));
            });
    };

    return <form onSubmit={onOrgSubmit}>
        <Grid container spacing={2}>
            <Grid size={{xs: 12, sm: 6, md: 4, lg: 4, xl: 4}} offset={{xs: 0, sm: 3, md: 4, lg: 4, xl: 4}}>
                <TextField
                    autoFocus
                    margin="dense"
                    label={t('components:organization_selector_container.fields.organization_id.label')}
                    fullWidth
                    name="orgId"
                    variant="standard"
                    defaultValue={defaultOrgId}
                />
            </Grid>
            <Grid size={{xs: 12, sm: 6, md: 6, lg: 6, xl: 6}} offset={{xs: 0, sm: 3, md: 3, lg: 3, xl: 3}}>
                <Trans
                    i18nKey='components:organization_selector_container.description'
                    components={{
                        trackerSettings: <Link href="https://tracker.yandex.ru/settings" target="_blank" rel="nofollow noreferer" />,
                        cloudSettings: <Link href="https://org.cloud.yandex.ru/settings" target="_blank" rel="nofollow noreferer" />
                    }}
                />
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