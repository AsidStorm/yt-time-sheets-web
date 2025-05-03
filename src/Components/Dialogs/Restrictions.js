import React from "react";
import {Dialog, DialogTitle, DialogContent, Alert} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useAtomValue} from "jotai";
import {myUserAtom} from "../../jotai/atoms";

export function DialogsRestrictions({handleClose, state}) {
    const {t} = useTranslation();

    const {isReadOnly, isAdmin} = useAtomValue(myUserAtom);

    return <Dialog onClose={handleClose} open={state}>
        <DialogTitle>{t('components:restrictions_dialog.title')}</DialogTitle>
        <DialogContent>
            {isReadOnly && <Alert severity="warning">{t('components:restrictions_dialog.readonly_description')}</Alert>}
            {!isReadOnly && !isAdmin &&
                <Alert severity="warning">{t('components:restrictions_dialog.not_admin_description')}</Alert>}
        </DialogContent>
    </Dialog>
}