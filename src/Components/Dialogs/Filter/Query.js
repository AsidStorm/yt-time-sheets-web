import React, {Fragment, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useAddQueryToFavoriteDialog, useFavoriteQueriesDialog} from "../../../hooks";
import {useAtomValue} from "jotai";
import {favoriteQueriesAtom, selectedQueryAtom} from "../../../jotai/atoms";
import {pushAnalytics} from "../../../helpers";
import {
    Button,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
    Tooltip
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SettingsIcon from "@mui/icons-material/Settings";
import {FILTER_FIELD_QUERY} from "../../../constants";

export function QueryFilter() {
    const {t} = useTranslation();

    const {open: openAddQueryToFavoriteDialog} = useAddQueryToFavoriteDialog();
    const {open: openFavoriteQueriesDialog} = useFavoriteQueriesDialog();

    const defaultQuery = useAtomValue(selectedQueryAtom);
    const favoriteQueries = useAtomValue(favoriteQueriesAtom);

    const [query, setQuery] = useState("");

    const handleFastQueryClick = ({query}) => {
        setQuery(query);

        pushAnalytics('fastQueryClicked');
    };

    useEffect(() => {
        if( defaultQuery ) {
            setQuery(defaultQuery);
        }
    }, []);

    return <Fragment>
        <Grid size={{xs: 12}}>
            <FormControl fullWidth>
                <InputLabel>{t('filter:query.title')}</InputLabel>
                <OutlinedInput label={t('filter:query.title')} value={query} onChange={(e) => setQuery(e.target.value)} defaultValue={defaultQuery} variant="outlined" name={FILTER_FIELD_QUERY} fullWidth endAdornment={
                    <InputAdornment position="end">
                        <Tooltip title={t('common:button.add_to_favorite_question')}>
                            <IconButton
                                onClick={() => openAddQueryToFavoriteDialog(query)}
                                edge="end"
                            >
                                <FavoriteIcon/>
                            </IconButton>
                        </Tooltip>
                    </InputAdornment>
                }/>
            </FormControl>
        </Grid>
        {favoriteQueries && favoriteQueries.length > 0 && <Grid size={{xs: 12}}>
            <Stack direction="row" spacing={1}>
                {favoriteQueries.map(({query, name}, key) => <Button variant="text" key={`fast_query_${key}_${query}`}
                                                                     onClick={() => handleFastQueryClick({query})}
                                                                     size="small">
                    {name}
                </Button>)}
                <Tooltip title={t('filter:query.settings.tooltip')}>
                    <Button variant="text" size="small" onClick={() => openFavoriteQueriesDialog()}>
                        <SettingsIcon/>
                    </Button>
                </Tooltip>
            </Stack>
        </Grid>}
    </Fragment>
}