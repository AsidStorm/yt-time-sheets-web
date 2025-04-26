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
    Tooltip
} from "@mui/material";
import CakeIcon from '@mui/icons-material/Cake';
import {Trans, useTranslation} from 'react-i18next';
import {pushAnalytics} from "../helpers";


function DonateCard() {
    const {t} = useTranslation();

    const url = process.env.REACT_APP_DONATE_URL;
    const [infoDialog, setInfoDialog] = useState(false);

    return <Card>
        <Dialog open={infoDialog} onClose={() => setInfoDialog(false)} fullWidth maxWidth="sm">
            <DialogTitle>{t('components:donate_card.dialog.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Typography>
                        <Trans
                            i18nKey="components:donate_card.dialog.row_1"
                            components={{
                                tooltip: <Tooltip title={t('components:donate_card.dialog.row_1.tooltip')}/>,
                                decoration: <Typography component="span" sx={{textDecoration: 'underline'}}/>
                            }}
                        />
                    </Typography>
                    <Typography>
                        {t('components:donate_card.dialog.row_2')}
                    </Typography>
                    <Typography>
                        {t('components:donate_card.dialog.row_3')}
                    </Typography>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Link href={url} target="_blank" rel="nofollow noopener" variant="button" underline="none"
                      onClick={() => pushAnalytics("donate", {source: "dialog"})}>{t('components:donate_card.dialog.button.donate')}</Link>
                <Button onClick={() => setInfoDialog(false)}>{t('common:button.thanks')}</Button>
            </DialogActions>
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
                      onClick={() => pushAnalytics("donate", {source: "card"})}>{t('components:donate_card.donate_link_title')}</Link>
            </React.Fragment>}
        />
    </Card>
}

export default DonateCard;