import React, {Fragment} from "react";

import SettingsIcon from "@mui/icons-material/Settings";
import {Fab} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useSettingsDialog} from "../hooks";
import {DialogsSettings} from "./Dialogs/Settings";

export function SettingsButton() {
    const {t} = useTranslation();

    const { open: openSettingsDialog } = useSettingsDialog();

    return <Fragment>
        <DialogsSettings />

        <Fab sx={{position: 'absolute', bottom: 16, right: 16, zIndex: 999999 }} color="primary" variant="extended" onClick={openSettingsDialog}>
            <SettingsIcon sx={{ mr: 1 }} />
            {t('common:button.settings')}
        </Fab>
    </Fragment>
}