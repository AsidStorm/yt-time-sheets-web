import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import React from "react";
import DialogContentText from "@mui/material/DialogContentText";
import {patch} from "../requests";
import {pushAnalytics, replaceRuDuration} from "../helpers";

function UpdateWorkLogDialog({state, handleClose, onSubmit, data, title, issueKey, workLogId, showError, showSuccess, startLoading, endLoading}) {
    const { comment, duration } = data;

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        const comment = data.get("comment");
        const duration = replaceRuDuration(data.get("duration"));

        if( duration.includes('-') ) {
            return showError("Нельзя указывать отрицательное время");
        }

        startLoading();

        patch("/api/v1/work_logs", {
            workLogId,
            issueKey,
            duration,
            comment,
        }).then(response => {
            showSuccess("Затраченное время успешно изменено");
            onSubmit(response.data);

            pushAnalytics('workLogUpdated');
        }).catch( showError ).finally( endLoading );
    };

    return <Dialog open={state} onClose={() => handleClose()}>
        <form onSubmit={(e) => handleSubmit(e)}>
            <DialogTitle>Изменение рабочего времени</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Вы уверены, что хотите изменить эту запись о времени?<br/>
                    {title}
                </DialogContentText>

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Время"
                            fullWidth
                            name="duration"
                            variant="standard"
                            defaultValue={duration}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Комментарий"
                            multiline
                            fullWidth
                            rows={5}
                            defaultValue={comment}
                            name="comment"
                            variant="standard"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose()} color="warning">Отмена</Button>
                <Button type="submit" color="success">Изменить</Button>
            </DialogActions>
        </form>
    </Dialog>
}

export default UpdateWorkLogDialog;