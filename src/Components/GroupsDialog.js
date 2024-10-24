import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from '@mui/icons-material/Person';
import { blue } from '@mui/material/colors';
import React from "react";
import List from "@mui/material/List";

function GroupsDialog({ state, handleClose, groups, onSelect}) {
    return <Dialog onClose={handleClose} open={state}>
        <DialogTitle>Выберите группу</DialogTitle>
        <List sx={{ pt: 0 }}>
            {groups.map((group) => (
                <ListItem button onClick={() => onSelect(group)} key={`group-${group.value}`}>
                    <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: blue[100], color: blue[600] }}>
                            <PersonIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`${group.label} (${group.members.length})`} />
                </ListItem>
            ))}
        </List>
    </Dialog>
}

export default GroupsDialog;