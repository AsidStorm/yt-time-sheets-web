import React from "react";
import {
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    IconButton
} from "@mui/material";
import {useTranslation} from "react-i18next";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {yandexTrackerIssueUrl} from "../../helpers";

export function DialogsIssueSearch({state, handleClose, tasks, onSelect}) {
    const {t} = useTranslation();
    const handleOpenInNewTab = (e, issueKey) => {
        e.preventDefault();
        e.stopPropagation();

        window.open(yandexTrackerIssueUrl(issueKey))
    };

    return <Dialog onClose={handleClose} open={state}>
        <DialogTitle>{t('components:task_search_dialog.title')}</DialogTitle>
        <List sx={{pt: 0}}>
            {tasks.map((task) => (
                <ListItem button
                          onClick={() => onSelect(task)} key={`issue-search-${task.id}`}
                          sx={{cursor: 'pointer'}}
                          secondaryAction={
                              <IconButton onClick={(e) => handleOpenInNewTab(e, task.id)}>
                                  <OpenInNewIcon/>
                              </IconButton>
                          }
                >
                    <ListItemText primary={task.attributes.summary} secondary={task.id}/>
                </ListItem>
            ))}
        </List>
    </Dialog>
}