import React from "react";
import {
    Dialog,
    DialogTitle,
    ListItem,
    ListItemText,
    List,
    TextField,
    FormControl,
    IconButton
} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useAtom, useAtomValue} from "jotai";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import {favoriteGroupsAtom, orderedGroupsAtom} from "../jotai/atoms";


function GroupsDialog({state, handleClose, onSelect}) {
    const {t} = useTranslation();

    const groups = useAtomValue(orderedGroupsAtom);
    const [favorites, setFavorites] = useAtom(favoriteGroupsAtom);

    const handleFavoriteGroupClick = (e, group) => {
        e.preventDefault();
        e.stopPropagation();

        setFavorites(prev => prev.includes(group.value) ? prev.filter(f => f !== group.value) : [...prev, group.value]);
    };

    const isFavorite = group => favorites.includes(group.value);

    return <Dialog onClose={handleClose} open={state} maxWidth="sm" fullWidth>
        <DialogTitle>{t('components:groups_dialog.title')}</DialogTitle>
        <List sx={{pt: 0}}>
            <ListItem>
                <FormControl fullWidth>
                    <TextField label={t('components:groups_dialog.search')} variant="standard" autoFocus/>
                </FormControl>
            </ListItem>
            {groups.map(group => (
                <ListItem button onClick={() => onSelect(group)} key={`group-${group.value}`} sx={{cursor: 'pointer'}}
                          secondaryAction={
                              <IconButton edge="end" onClick={(e) => handleFavoriteGroupClick(e, group)}
                                          color={isFavorite(group) ? 'error' : 'primary'}>
                                  {isFavorite(group) ? <FavoriteIcon/> : <FavoriteBorderIcon/>}
                              </IconButton>
                          }>
                    <ListItemText primary={group.label}
                                  secondary={t('components:groups_dialog.users', {count: group.members.length})}/>
                </ListItem>
            ))}
        </List>
    </Dialog>
}

export default GroupsDialog;