import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import React from "react";
import {remove} from "../requests";
import {pushAnalytics} from "../helpers";

function DeleteWorkLogDialog({state, handleCLose, title, workLogId, issueKey, showSuccess, showError, startLoading, endLoading, onSubmit}) {
    const handleSubmit = (e) => {
        e.preventDefault();

        startLoading();

        remove("/api/v1/work_logs", {
            workLogId: workLogId,
            issueKey: issueKey,
        }).then(() => {
            showSuccess("Запись успешно удалена");
            onSubmit({ issueKey, workLogId });
            pushAnalytics('workLogDeleted');
        }).catch( showError ).finally(endLoading);
    };

    return <Dialog open={state} onClose={() => handleCLose()}>
        <form onSubmit={(e) => handleSubmit(e)}>
            <DialogTitle>Удаление рабочего времени</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Вы уверены, что хотите удалить эту запись о времени?<br/>
                    {title}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleCLose()} color="warning">Отмена</Button>
                <Button type="submit" color="error">Удалить</Button>
            </DialogActions>
        </form>
    </Dialog>
}

export default DeleteWorkLogDialog;