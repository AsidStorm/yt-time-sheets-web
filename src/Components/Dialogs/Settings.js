import {useSettingsDialog} from "../../hooks";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Container,
    Grid2 as Grid,
    FormControl,
    Button, FormGroup, FormControlLabel, Checkbox, FormLabel, RadioGroup, Radio
} from "@mui/material";
import React from "react";
import {useTranslation} from "react-i18next";
import {COLOR_THEMES, LOCALES} from "../../constants";
import {useAtom} from "jotai";
import {colorThemeAtom, insightsEnabledAtom, localeAtom} from "../../jotai/atoms";

export function DialogsSettings() {
    const {t, i18n} = useTranslation();

    const [locale, setLocale] = useAtom(localeAtom);
    const [colorTheme, setColorTheme] = useAtom(colorThemeAtom);
    const [insightsEnabled, setInsightsEnabled] = useAtom(insightsEnabledAtom);

    const {isOpen, close} = useSettingsDialog();

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
                            <FormLabel>{t('components:dialogs.settings.fields.locale.label')}</FormLabel>
                            <RadioGroup
                                row
                                name="locale"
                                value={locale}
                                onChange={handleLocaleChange}
                            >
                                {LOCALES.map(l => <FormControlLabel value={l} control={<Radio/>}
                                                                    label={t(`common:language.${l}`)}
                                                                    key={`locale-${l}`}/>)}
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <FormControl fullWidth>
                            <FormLabel>{t('components:dialogs.settings.fields.color_theme.label')}</FormLabel>
                            <RadioGroup
                                row
                                name="color-theme"
                                value={colorTheme}
                                onChange={handleColorThemeChange}
                            >
                                {COLOR_THEMES.map(theme => <FormControlLabel value={theme} control={<Radio/>}
                                                                             label={t(`common:color_theme.${theme}`)}
                                                                             key={`color-theme-${theme}`}/>)}
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox/>}
                                              label={t('components:dialogs.settings.fields.insights_enabled.label')}
                                              checked={insightsEnabled}
                                              onChange={(e) => setInsightsEnabled(e.target.checked)}/>
                        </FormGroup>
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