import React, {Fragment} from "react";
import {Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Link} from "@mui/material";
import {remove} from "../requests";
import {pushAnalytics, yandexTrackerIssueUrl} from "../helpers";
import {useTranslation} from "react-i18next";
import {useSetAtom} from "jotai";
import {workLogsAtom} from "../jotai/atoms";
import {useDeleteWorkLogDialog, useHumanizeDuration, useLoader} from "../hooks";

function DeleteWorkLogDialog({showSuccess, showError}) {
    const { t } = useTranslation();

    const { startLoading, endLoading } = useLoader();
    const { close, isOpen, workLogId, issueKey, createdById, createdByDisplay, issueTitle, value } = useDeleteWorkLogDialog();
    const humanize = useHumanizeDuration();

    const setWorkLogs = useSetAtom(workLogsAtom);

    const title = () => {
        return <Fragment>
            {createdByDisplay}, <Link href={yandexTrackerIssueUrl(issueKey)} target="_blank" rel="nofollow noreferrer">{issueTitle}</Link>: {humanize(value, {[createdById]: value})}
        </Fragment>
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        startLoading();

        remove("/api/v1/work_logs", {
            workLogId: workLogId,
            issueKey: issueKey,
        }).then(() => {
            showSuccess(t('notifications:work_log_deleted'));

            setWorkLogs(prev => prev.filter( log => {
                return log.workLogId !== workLogId;
            }));

            pushAnalytics('workLogDeleted');

            close();
        }).catch( showError ).finally(endLoading);
    };

    return <Dialog open={isOpen} onClose={() => close()}>
        <form onSubmit={(e) => handleSubmit(e)}>
            <DialogTitle>{t('components:delete_work_log_dialog.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('components:delete_work_log_dialog.text')}<br/>
                    {title()}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()} color="warning">{t('common:button.cancel')}</Button>
                <Button type="submit" color="error">{t('common:button.delete')}</Button>
            </DialogActions>
        </form>
    </Dialog>
}

export default DeleteWorkLogDialog;