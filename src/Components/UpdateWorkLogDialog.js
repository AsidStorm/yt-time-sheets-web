import React from "react";
import {
    DialogTitle,
    DialogContent,
    Grid2 as Grid,
    TextField,
    DialogActions,
    Button,
    Dialog,
    DialogContentText,
    Link
} from "@mui/material";
import {Trans, useTranslation} from "react-i18next";
import {patch} from "../requests";
import {pushAnalytics, replaceRuDuration, yandexTrackerIssueUrl} from "../helpers";
import {useHumanizeDuration, useLoader, useMessage, useUpdateWorkLogDialog} from "../hooks";
import {useSetAtom} from "jotai/index";
import {workLogsAtom} from "../jotai/atoms";

function UpdateWorkLogDialog() {
    const {t} = useTranslation();

    const setWorkLogs = useSetAtom(workLogsAtom);

    const { showSuccess, showError } = useMessage();
    const humanize = useHumanizeDuration();
    const {
        isOpen,
        close,
        comment,
        duration,
        issueKey,
        workLogId,
        createdByDisplay,
        issueTitle,
        createdById,
        value
    } = useUpdateWorkLogDialog();

    const {startLoading, endLoading} = useLoader();

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        const comment = data.get("comment");
        const duration = replaceRuDuration(data.get("duration"));

        if (duration.includes('-')) {
            return showError(t('notifications:unable_to_set_negative_time'));
        }

        startLoading();

        patch("/api/v1/work_logs", {
            workLogId,
            issueKey,
            duration,
            comment,
        }).then(response => {
            showSuccess(t('notifications:work_log_updated'));

            const workLog = response.data;

            setWorkLogs(prev => prev.map(log => {
                if (log.workLogId === workLog.workLogId) {
                    return workLog;
                }

                return log;
            }));

            pushAnalytics('workLogUpdated');

            close();
        }).catch(showError).finally(endLoading);
    };

    return <Dialog open={isOpen} onClose={() => close()}>
        <form onSubmit={(e) => handleSubmit(e)}>
            <DialogTitle>{t('components:update_work_log_dialog.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('components:update_work_log_dialog.text')}<br/>
                    <Trans
                        i18nKey='components:update_work_log_dialog.description_text'
                        values={{createdByDisplay, value: humanize(value, {[createdById]: value}), issueTitle}}
                        components={{
                            issue: <Link href={yandexTrackerIssueUrl(issueKey)} target="_blank" rel="nofollow noopener"/>
                        }}
                    />
                </DialogContentText>

                <Grid container spacing={2}>
                    <Grid size={{xs: 12}}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label={t('components:update_work_log_dialog.fields.duration.label')}
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
                            label={t('components:update_work_log_dialog.fields.comment.label')}
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