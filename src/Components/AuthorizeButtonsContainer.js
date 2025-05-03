import React, {useState} from "react";
import {Button, Grid2 as Grid, SvgIcon} from "@mui/material";
import {pushAnalytics} from "../helpers";
import CopyrightCard from "./CopyrightCard";
import SsoDialog from "./SsoDialog";
import {AUTHORIZED_STATE_DONE, AUTHORIZED_STATE_NO_ORG_ID} from "../constants";
import DonateCard from "./DonateCard";
import PeopleIcon from '@mui/icons-material/People';
import Typography from "@mui/material/Typography";
import {ReactComponent as YandexIcon} from "../assets/yandex.svg";
import {useTranslation} from "react-i18next";


export function AuthorizeButtonsContainer({
                                              OAuthClientId,
                                              allowManualInput,
                                              federationId,
                                              defaultOrgId,
                                              setAuthorized
                                          }) {
    const {t} = useTranslation();

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
            state={ssoDialog.open}
            handleClose={() => setSsoDialog(prev => ({...prev, open: false}))}
            handleIAmToken={handleIAmToken}
            federationId={federationId}
            allowManualInput={allowManualInput}
        />

        {OAuthClientId !== '' && <Grid size={{xs: 12, sm: 8, md: 4, lg: 3, xl: 2}}>
            <Button size="large" fullWidth sx={{height: 65, borderRadius: 7, textTransform: 'none'}} variant="contained"
                    color="yandex" startIcon={<SvgIcon component={YandexIcon} inheritViewBox fontSize="large"/>}
                    onClick={() => {
                        pushAnalytics('yandexButtonClick');
                        redirectToYandexOAuth();
                    }}>
                <Typography fontSize="1.2rem">
                    {t('components:authorize_buttons_container.yandex_id')}
                </Typography>
            </Button>
        </Grid>}

        <Grid size={{xs: 12, sm: 8, md: 4, lg: 3, xl: 2}}>
            <Button size="large" fullWidth sx={{height: 65, borderRadius: 7, textTransform: 'none'}} variant="contained"
                    startIcon={<PeopleIcon/>} onClick={() => {
                setSsoDialog(prev => ({...prev, open: true}));
                pushAnalytics('ssoButtonClick');
            }}>
                <Typography fontSize="1.2rem">
                    {t('components:authorize_buttons_container.sso')}
                </Typography>
            </Button>
        </Grid>
        <Grid size={{xs: 12, sm: 8, md: 4, lg: 3, xl: 2}}>
            <CopyrightCard/>
        </Grid>
        <Grid size={{xs: 12, sm: 8, md: 4, lg: 3, xl: 2}}>
            <DonateCard/>
        </Grid>
    </Grid>
}