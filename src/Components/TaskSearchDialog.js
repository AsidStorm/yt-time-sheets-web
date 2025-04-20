import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import React from "react";
import IconButton from "@mui/material/IconButton";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {yandexTrackerIssueUrl} from "../helpers";
import {Trans} from "react-i18next";

function TaskSearchDialog({state, handleClose, tasks, onSelect}) {
    const handleOpenInNewTab = (e, issueKey) => {
        e.preventDefault();
        e.stopPropagation();

        window.open(yandexTrackerIssueUrl(issueKey))
    };

    return <Dialog onClose={handleClose} open={state}>
        <DialogTitle><Trans>Выберите задачу</Trans></DialogTitle>
        <List sx={{ pt: 0 }}>
            {tasks.map((task) => (
                <ListItem button onClick={() => onSelect(task)} key={`task-${task.id}`}>
                    <ListItemText primary={task.attributes.summary} secondary={task.id} />
                    <IconButton onClick={(e) => handleOpenInNewTab(e, task.id)}>
                        <OpenInNewIcon />
                    </IconButton>
                </ListItem>
            ))}
        </List>
    </Dialog>
}

export default TaskSearchDialog;