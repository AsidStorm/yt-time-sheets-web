import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import React, {Fragment} from "react";
import DialogContentText from "@mui/material/DialogContentText";
import {patch} from "../requests";
import {pushAnalytics, replaceRuDuration, yandexTrackerIssueUrl} from "../helpers";
import {Trans, useTranslation} from "react-i18next";
import {useHumanizeDuration, useLoader, useUpdateWorkLogDialog} from "../hooks";
import Link from "@mui/material/Link";

function UpdateWorkLogDialog({onSubmit, showError, showSuccess}) {
    const { t } = useTranslation();

    const humanize = useHumanizeDuration();
    const { isOpen, close, comment, duration, issueKey, workLogId, createdByDisplay, issueTitle, createdById, value } = useUpdateWorkLogDialog();

    const { startLoading, endLoading } = useLoader();

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        const comment = data.get("comment");
        const duration = replaceRuDuration(data.get("duration"));

        if( duration.includes('-') ) {
            return showError(t('Нельзя указывать отрицательное время'));
        }

        startLoading();

        patch("/api/v1/work_logs", {
            workLogId,
            issueKey,
            duration,
            comment,
        }).then(response => {
            showSuccess(t('Затраченное время успешно изменено'));
            onSubmit(response.data);

            pushAnalytics('workLogUpdated');
        }).catch( showError ).finally( endLoading );
    };

    function Title() {
        return <Fragment>
            {createdByDisplay}, <Link href={yandexTrackerIssueUrl(issueKey)} target="_blank" rel="nofollow noopener">{issueTitle}</Link>: {humanize(value, {[createdById]: value})}
        </Fragment>
    }

    return <Dialog open={isOpen} onClose={() => close()}>
        <form onSubmit={(e) => handleSubmit(e)}>
            <DialogTitle><Trans>Изменение рабочего времени</Trans></DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Trans>Вы уверены, что хотите изменить эту запись о времени?</Trans><br/>
                    <Title />
                </DialogContentText>

                <Grid container spacing={2}>
                    <Grid size={{xs: 12}}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label={t('Новое время')}
                            fullWidth
                            name="duration"
                            variant="standard"
                            defaultValue={duration}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid size={{xs: 12}}>
                        <TextField
                            label={t('Комментарий')}
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
                <Button onClick={() => close()} color="warning">{t('common:button.cancel')}</Button>
                <Button type="submit" color="success">{t('common:button.update')}</Button>
            </DialogActions>
        </form>
    </Dialog>
}

export default UpdateWorkLogDialog;