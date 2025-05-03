import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogTitle,
    ListItem,
    ListItemText,
    List,
    TextField,
    FormControl,
    IconButton, Tooltip
} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useAtomValue, useSetAtom} from "jotai";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import {favoriteGroupsAtom, orderedGroupsAtom} from "../../jotai/atoms";
import {createLabelFilter} from "../../helpers";

export function DialogsGroups({state, handleClose, onSelect}) {
    const {t} = useTranslation();

    const groups = useAtomValue(orderedGroupsAtom);
    const setFavorites = useSetAtom(favoriteGroupsAtom);
    const [filteredGroups, setFilteredGroups] = useState([]);

    const [search, setSearch] = useState("");

    useEffect(() => {
        const nextGroups = JSON.parse(JSON.stringify(groups));
        const filter = createLabelFilter(search, group => group.label);

        setFilteredGroups(nextGroups.filter( filter ));
    }, [groups, search]);

    const handleFavoriteGroupClick = (e, group) => {
        e.preventDefault();
        e.stopPropagation();

        setFavorites(prev => prev.includes(group.value) ? prev.filter(f => f !== group.value) : [...prev, group.value]);
    };

    return <Dialog onClose={handleClose} open={state} maxWidth="sm" fullWidth>
        <DialogTitle>{t('components:groups_dialog.title')}</DialogTitle>
        <List sx={{pt: 0}}>
            <ListItem>
                <FormControl fullWidth>
                    <TextField label={t('components:groups_dialog.search')} variant="standard" autoFocus onChange={({ target }) => setSearch(target.value)}/>
                </FormControl>
            </ListItem>
            {filteredGroups.map(group => (
                <ListItem button onClick={() => onSelect(group)} key={`group-${group.value}`} sx={{cursor: 'pointer'}}
                          secondaryAction={
                    <Tooltip title={t(`components:dialogs.groups.tooltip.${group.isFavorite ? 'favorite' : 'make_favorite'}`)}>
                              <IconButton edge="end" onClick={(e) => handleFavoriteGroupClick(e, group)}
                                          color={group.isFavorite ? 'error' : 'primary'}>
                                  {group.isFavorite ? <FavoriteIcon/> : <FavoriteBorderIcon/>}
                              </IconButton>
                    </Tooltip>
                          }>
                    <ListItemText primary={group.label}
                                  secondary={t('components:groups_dialog.users', {count: group.members.length})}/>
                </ListItem>
            ))}
        </List>
    </Dialog>
}