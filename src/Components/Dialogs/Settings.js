import {useSettingsDialog} from "../../hooks";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Container,
    Grid2 as Grid,
    FormControl,
    Select,
    MenuItem, InputLabel, Button
} from "@mui/material";
import React from "react";
import {useTranslation} from "react-i18next";
import {COLOR_THEMES, LOCALES} from "../../constants";
import {useAtom} from "jotai";
import {colorThemeAtom, localeAtom} from "../../jotai/atoms";

export function DialogsSettings() {
    const {t, i18n} = useTranslation();

    const [locale, setLocale] = useAtom(localeAtom);
    const [colorTheme, setColorTheme] = useAtom(colorThemeAtom);

    const { isOpen, close } = useSettingsDialog();

    const handleLocaleChange = event => {
        const nextLocale = event.target.value;

        i18n.changeLanguage(nextLocale);
        setLocale(nextLocale);
    };

    const handleColorThemeChange = event => {
        const nextColorTheme = event.target.value;

        setColorTheme(nextColorTheme);
    };

    return <Dialog onClose={close} open={isOpen} maxWidth="sm" fullWidth>
        <DialogTitle>{t('components:dialogs.settings.title')}</DialogTitle>
        <DialogContent>
            <Container component="main" sx={{mt: 2, mb: 2}} maxWidth={false}>
                <Grid container spacing={2}>
                    <Grid size={{xs: 12}}>
                        <FormControl fullWidth>
                            <InputLabel>{t('components:dialogs.settings.fields.locale.label')}</InputLabel>
                            <Select
                                value={locale}
                                label={t('components:dialogs.settings.fields.locale.label')}
                                onChange={handleLocaleChange}
                            >
                                {LOCALES.map( l => <MenuItem key={`locale-${l}`} value={l}>
                                    {t(`common:language.${l}`)}
                                </MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <FormControl fullWidth>
                            <InputLabel>{t('components:dialogs.settings.fields.color_theme.label')}</InputLabel>
                            <Select
                                value={colorTheme}
                                label={t('components:dialogs.settings.fields.color_theme.label')}
                                onChange={handleColorThemeChange}
                            >
                                {COLOR_THEMES.map( theme => <MenuItem key={`color-theme-${theme}`} value={theme}>
                                    {t(`common:color_theme.${theme}`)}
                                </MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <FormControl fullWidth>
                            <Button variant="contained" onClick={close}>{t('common:button.close')}</Button>
                        </FormControl>
                    </Grid>
                </Grid>
            </Container>

        </DialogContent>
    </Dialog>
}