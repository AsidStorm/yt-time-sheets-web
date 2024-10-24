import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";
import DialogContent from "@mui/material/DialogContent";
import Alert from "@mui/material/Alert";

function RestrictionsDialog({ readOnly, admin, handleClose, state }) {
    return <Dialog onClose={handleClose} open={state}>
        <DialogTitle>На вашу учётную запись действую ограничения</DialogTitle>
        <DialogContent>
            {readOnly && <Alert severity="warning">Ваша учётная запись доступна только для чтения, создание, изменение или удаление времени невозможно.</Alert>}
            {!readOnly && !admin && <Alert severity="warning">У вашей учётной записи нет прав администратора Yandex.360, вы не можете создавать рабочее время за других пользователей.</Alert>}
        </DialogContent>
    </Dialog>
}

export default RestrictionsDialog;