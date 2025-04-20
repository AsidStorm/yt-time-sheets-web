import React from "react";
import {Dialog, DialogTitle, DialogContent, Alert} from "@mui/material";
import {Trans} from "react-i18next";
import {useAtomValue} from "jotai";
import {myUserAtom} from "../jotai/atoms";

function RestrictionsDialog({ handleClose, state }) {
    const myUser = useAtomValue(myUserAtom);

    return <Dialog onClose={handleClose} open={state}>
        <DialogTitle><Trans>На вашу учётную запись действуют ограничения</Trans></DialogTitle>
        <DialogContent>
            {myUser.isReadOnly && <Alert severity="warning"><Trans>Ваша учётная запись доступна только для чтения, создание, изменение или удаление времени невозможно.</Trans></Alert>}
            {!myUser.isReadOnly && !myUser.isAdmin && <Alert severity="warning"><Trans>У вашей учётной записи нет прав администратора Yandex.360, вы не можете создавать рабочее время за других пользователей.</Trans></Alert>}
        </DialogContent>
    </Dialog>
}

export default RestrictionsDialog;