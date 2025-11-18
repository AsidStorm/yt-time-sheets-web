import {useTranslation} from "react-i18next";
import {useFavoriteQueriesDialog} from "../../hooks";
import React, {useEffect} from "react";
import {useAtom} from "jotai";
import {favoriteQueriesAtom} from "../../jotai/atoms";

import {
    Dialog,
    DialogTitle,
    ListItem, Tooltip, IconButton, ListItemText, List
} from "@mui/material";
import {pushAnalytics} from "../../helpers";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export function FavoriteQueriesDialog() {
    const {t} = useTranslation();

    const [favoriteQueries, setFavoriteQueries] = useAtom(favoriteQueriesAtom);

    const {isOpen, close} = useFavoriteQueriesDialog();

    useEffect(() => {
        if( favoriteQueries.length === 0 ) {
            close();
        }
    }, [favoriteQueries]);

    const handleRemoveQuery = (idx) => {
        pushAnalytics('favoriteQueryDeleted');

        setFavoriteQueries(prev => prev.filter((_, index) => index !== idx));
    };

    const handleMoveToTopQuery = (idx) => {
        pushAnalytics('favoriteMovedToTop');

        setFavoriteQueries(prev => {
            const next = [...prev];

            [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];

            return next;
        });
    };

    const handleMoveToBottomQuery = (idx) => {
        pushAnalytics('favoriteMovedToBottom');

        setFavoriteQueries(prev => {
            const next = [...prev];

            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];

            return next;
        });
    };

    return <Dialog onClose={close} open={isOpen} maxWidth="sm" fullWidth>
        <DialogTitle>{t('components:dialogs.favorite_queries.title')}</DialogTitle>
        <List sx={{pt: 0}}>
            {favoriteQueries.map((query, idx) => (
                <ListItem key={`query-${idx}-${query.name}`}
                          secondaryAction={
                                <React.Fragment>
                                    {idx > 0 && <Tooltip title={t(`components:dialogs.favorite_queries.tooltip.move_up`)}>
                                        <IconButton edge="end" onClick={() => handleMoveToTopQuery(idx)}
                                                    color="primary">
                                            <ArrowUpwardIcon />
                                        </IconButton>
                                    </Tooltip>}
                                    {idx !== favoriteQueries.length - 1 && <Tooltip title={t(`components:dialogs.favorite_queries.tooltip.move_down`)}>
                                        <IconButton edge="end" onClick={() => handleMoveToBottomQuery(idx)}
                                                    color="primary">
                                            <ArrowDownwardIcon />
                                        </IconButton>
                                    </Tooltip>}
                              <Tooltip title={t(`components:dialogs.favorite_queries.tooltip.remove`)}>
                                  <IconButton edge="end" onClick={() => handleRemoveQuery(idx)}
                                              color="error">
                                      <DeleteIcon />
                                  </IconButton>
                              </Tooltip>
                                </React.Fragment>
                          }>
                    <ListItemText primary={query.name} secondary={query.query} />
                </ListItem>
            ))}
        </List>
    </Dialog>
}