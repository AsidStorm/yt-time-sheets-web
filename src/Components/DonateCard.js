import React, {useState} from "react";
import {
    Card,
    CardHeader,
    Avatar,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    DialogContentText,
    Typography,
    Tooltip, Alert, IconButton, CardContent, Divider, CardActions
} from "@mui/material";
import CakeIcon from '@mui/icons-material/Cake';
import TelegramIcon from '@mui/icons-material/Telegram';
import {Trans, useTranslation} from 'react-i18next';
import {pushAnalytics} from "../helpers";
import {useChangelogDialog} from "../hooks";


function DonateCard() {
    const {t} = useTranslation();

    const {open: openChangelogDialog} = useChangelogDialog();

    const url = process.env.REACT_APP_DONATE_URL;
    const [infoDialog, setInfoDialog] = useState(false);

    return <Card>
        <Dialog open={infoDialog} onClose={() => setInfoDialog(false)} fullWidth maxWidth="sm">
            <Card>
                <CardHeader
                    avatar={
                        <Avatar>
                            R
                        </Avatar>
                    }
                    action={
                        <Tooltip title={t('components:donate_card.dialog.telegram.tooltip')}>
                            <IconButton onClick={() => {
                                window.open('https://t.me/asidstorm');
                                pushAnalytics('telegramClicked');
                            }} color="primary">
                                <TelegramIcon/>
                            </IconButton>
                        </Tooltip>
                    }
                    title={t('components:donate_card.dialog.author')}
                    subheader={t('components:donate_card.dialog.author_description')}
                />
                <CardContent>
                    <Typography variant="body1" sx={{color: 'text.secondary'}}>
                        <Trans
                            i18nKey="components:donate_card.dialog.row_1"
                            components={{
                                tooltip: <Tooltip title={t('components:donate_card.dialog.row_1.tooltip')}/>,
                                decoration: <Typography component="span" sx={{textDecoration: 'underline'}}/>
                            }}
                        />
                    </Typography>
                    <Typography variant="body1" sx={{color: 'text.secondary', pt: 1}}>
                        {t('components:donate_card.dialog.row_1_5')}
                    </Typography>
                    <Typography variant="body1" sx={{color: 'text.secondary', pt: 1}}>
                        {t('components:donate_card.dialog.row_2')}
                    </Typography>
                    <Typography variant="body1" sx={{color: 'text.secondary', pt: 1}}>
                        {t('components:donate_card.dialog.row_3')}
                    </Typography>
                    <Typography variant="body1" sx={{color: 'text.secondary', pt: 1}}>
                        {t('components:donate_card.dialog.title')}
                    </Typography>
                </CardContent>
                <CardActions sx={{justifyContent: 'flex-end'}}>
                    <Link href={url} target="_blank" rel="nofollow noopener" variant="button" underline="none"
                          onClick={() => pushAnalytics("donate", {source: "dialog"})}>{t('components:donate_card.dialog.button.donate')}</Link>
                    <Button onClick={() => {openChangelogDialog(); pushAnalytics('changelogClicked'); }}>{t('common:button.changelog')}</Button>
                    <Button onClick={() => setInfoDialog(false)}>{t('common:button.thanks')}</Button>
                </CardActions>
            </Card>
        </Dialog>

        <CardHeader
            avatar={
                <Avatar sx={{bgcolor: "orange"}}>
                    <CakeIcon/>
                </Avatar>
            }
            title={<Trans
                i18nKey="components:donate_card.title"
                components={{
                    dialogLink: <Link href="#" onClick={() => {
                        setInfoDialog(true);
                        pushAnalytics("donateInfo");
                    }} underline={"none"}/>
                }}
            />}
            subheader={<React.Fragment>
                <Link href={url} target="_blank" rel="nofollow noopener"
                      onClick={() => { pushAnalytics("donate", {source: "card"}); setInfoDialog(true); }}>{t('components:donate_card.donate_link_title')}</Link>
            </React.Fragment>}
        />
    </Card>
}

export default DonateCard;