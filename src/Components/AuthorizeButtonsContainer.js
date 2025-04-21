import React, {useState} from "react";
import {Grid2 as Grid} from "@mui/material";
import {pushAnalytics} from "../helpers";
import YandexSso from "../assets/yandex-sso.svg";
import YandexId from "../assets/yandex-id-big.svg";
import CopyrightCard from "./CopyrightCard";
import SsoDialog from "./SsoDialog";
import {AUTHORIZED_STATE_DONE, AUTHORIZED_STATE_NO_ORG_ID} from "../constants";
import DonateCard from "./DonateCard";

export function AuthorizeButtonsContainer({
                                              OAuthClientId,
                                              allowManualInput,
                                              federationId,
                                              defaultOrgId,
                                              showError,
                                              setAuthorized
                                          }) {
    const [ssoDialog, setSsoDialog] = useState({
        open: false
    });

    const handleIAmToken = (iAmToken) => {
        localStorage.setItem("iAmToken", iAmToken);

        if (!allowManualInput && defaultOrgId !== "") {
            setAuthorized(AUTHORIZED_STATE_DONE);
        } else {
            setAuthorized(AUTHORIZED_STATE_NO_ORG_ID);
        }

        setSsoDialog(prev => ({
            ...prev,
            open: false
        }));
    };

    const redirectToYandexOAuth = () => {
        window.location.href = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${OAuthClientId}`
    };

    return <Grid container spacing={2} direction="column"
                 alignItems="center" alignContent="center" justifyContent="center">
        <SsoDialog
            showError={showError}
            state={ssoDialog.open}
            handleClose={() => setSsoDialog(prev => ({...prev, open: false}))}
            handleIAmToken={handleIAmToken}
            federationId={federationId}
            allowManualInput={allowManualInput}
        />

        {OAuthClientId !== '' && <Grid size={{xs: 12, sm: 8, md: 4, lg: 3, xl: 2}}>
            <img src={YandexId} style={{cursor: "pointer"}} onClick={() => {
                pushAnalytics('yandexButtonClick');
                redirectToYandexOAuth();
            }}/>
        </Grid>}
        <Grid size={{xs: 12, sm: 8, md: 4, lg: 3, xl: 2}}>
            <img src={YandexSso} style={{cursor: "pointer"}} onClick={() => {
                setSsoDialog(prev => ({...prev, open: true}));
                pushAnalytics('ssoButtonClick');
            }}/>
        </Grid>
        <Grid size={{xs: 12, sm: 8, md: 4, lg: 3, xl: 2}}>
            <CopyrightCard/>
        </Grid>
        <Grid size={{xs: 12, sm: 8, md: 4, lg: 3, xl: 2}}>
            <DonateCard/>
        </Grid>
    </Grid>
}