import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import {Trans, useTranslation} from "react-i18next";
import {useAtom, useAtomValue} from "jotai";
import {favoriteGroupsAtom, orderedGroupsAtom} from "../jotai/atoms";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';


function GroupsDialog({ state, handleClose, onSelect}) {
    const { t } = useTranslation();

    const groups = useAtomValue(orderedGroupsAtom);
    const [ favorites, setFavorites ] = useAtom(favoriteGroupsAtom);

    const handleFavoriteGroupClick = (e, group) => {
        e.preventDefault();
        e.stopPropagation();

        setFavorites( prev => prev.includes(group.value) ? prev.filter(f => f !== group.value) : [...prev, group.value] );
    };

    const isFavorite = group => favorites.includes(group.value);

    return <Dialog onClose={handleClose} open={state} maxWidth="sm" fullWidth>
        <DialogTitle>{t('components:groups_dialog.title')}</DialogTitle>
        <List sx={{ pt: 0 }}>
            <ListItem>
                <FormControl fullWidth>
                    <TextField label={t('components.groups_dialog.search')} variant="standard" autoFocus />
                </FormControl>
            </ListItem>
            {groups.map(group => (
                <ListItem button onClick={() => onSelect(group)} key={`group-${group.value}`} sx={{ cursor: 'pointer' }} secondaryAction={
                    <IconButton edge="end" onClick={(e) => handleFavoriteGroupClick(e, group)} color={isFavorite(group) ? 'error' : 'primary' }>
                        {isFavorite(group) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                }>
                    <ListItemText primary={group.label} secondary={`${group.members.length} человек`} />
                </ListItem>
            ))}
        </List>
    </Dialog>
}

export default GroupsDialog;