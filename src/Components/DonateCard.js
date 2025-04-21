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
import {pushAnalytics} from "../helpers";
import {Trans, useTranslation} from 'react-i18next';


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
                        Yandex Tracker Time Sheets был запущен <Tooltip
                        title={"Если быть точными, то 28 октября 2022 года"}><Typography component="span"
                                                                                         sx={{textDecoration: 'underline'}}>в
                        октябре 2022 года</Typography></Tooltip> и с тех пор постоянно развивается благодаря вашим
                        отзывам и предложениям.
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
                      onClick={() => pushAnalytics("donate", {source: "dialog"})}>Подарить печеньку</Link>
                <Button onClick={() => setInfoDialog(false)}>Спасибо</Button>
            </DialogActions>
        </Dialog>

        <CardHeader
            avatar={
                <Avatar sx={{bgcolor: "orange"}}>
                    <CakeIcon/>
                </Avatar>
            }
            title={<React.Fragment>
                <Trans>Нам 2,5 года <Link href="#" onClick={() => {
                    setInfoDialog(true);
                    pushAnalytics("donateInfo");
                }} underline={"none"}>^_^</Link></Trans>
            </React.Fragment>}
            subheader={<React.Fragment>
                <Link href={url} target="_blank" rel="nofollow noopener"
                      onClick={() => pushAnalytics("donate", {source: "card"})}><Trans>На печеньки разработчикам</Trans></Link>
            </React.Fragment>}
        />
    </Card>
}

export default DonateCard;