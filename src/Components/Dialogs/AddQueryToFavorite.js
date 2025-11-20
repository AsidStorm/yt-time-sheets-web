import {useTranslation} from "react-i18next";
import {useAddQueryToFavoriteDialog, useMessage} from "../../hooks";
import React, {useEffect, useState} from "react";
import {useAtomValue, useSetAtom} from "jotai";
import {favoriteQueriesAtom, filterQueryAtom} from "../../jotai/atoms";

import {
    Dialog,
    DialogContent,
    DialogTitle,
    Container,
    Grid,
    FormControl,
    Button,
    DialogActions,
    OutlinedInput, InputLabel
} from "@mui/material";
import {pushAnalytics} from "../../helpers";

export function AddQueryToFavoriteDialog() {
    const {t} = useTranslation();

    const {query, isOpen, close} = useAddQueryToFavoriteDialog();
    const setFavoriteQueries = useSetAtom(favoriteQueriesAtom);

    const {showError} = useMessage();

    const [name, setName] = useState("");
    const [realQuery, setRealQuery] = useState("");

    useEffect(() => {
        if( isOpen ) {
            setName("");
            setRealQuery(query);
        }
    }, [isOpen, query]);

    const addToFavorite = () => {
        if( name.trim() === "" ) {
            return showError(t('notifications:query_filter_name_is_empty'));
        }

        if( realQuery.trim() === "" ) {
            return showError(t('notifications:query_filter_query_is_empty'));
        }

        pushAnalytics('favoriteQueryCreated');

        const value = {
            query: realQuery,
            name: name.trim()
        };

        setFavoriteQueries(prev => prev ? [...prev, value] : [value]);

        close();
    };

    return <Dialog onClose={close} open={isOpen} maxWidth="sm" fullWidth>
        <DialogTitle>{t('components:dialogs.add_query_to_favorite.title')}</DialogTitle>
        <DialogContent>
            <Container component="main" sx={{mt: 2, mb: 2}} maxWidth={false}>
                <Grid container spacing={2}>
                    <Grid size={{xs: 12}}>
                        <FormControl fullWidth>
                            <InputLabel>{t('components:dialogs.add_query_to_favorite.fields.query.title')}</InputLabel>
                            <OutlinedInput defaultValue={realQuery} onChange={(e) => setRealQuery(e.target.value)} label={t('components:dialogs.add_query_to_favorite.fields.query.title')} variant="outlined" fullWidth />
                        </FormControl>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <FormControl fullWidth>
                            <InputLabel>{t('components:dialogs.add_query_to_favorite.fields.query.name')}</InputLabel>
                            <OutlinedInput label={t('components:dialogs.add_query_to_favorite.fields.query.name')} onChange={(e) => setName(e.target.value)} variant="outlined" fullWidth />
                        </FormControl>
                    </Grid>
                </Grid>
            </Container>
        </DialogContent>
        <DialogActions>
            <Button onClick={close}>{t('common:button.cancel')}</Button>
            <Button onClick={addToFavorite}>
                {t('common:button.add_to_favorite')}
            </Button>
        </DialogActions>
    </Dialog>
}