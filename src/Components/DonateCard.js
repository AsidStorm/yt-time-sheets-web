import {Card, CardHeader} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import CakeIcon from '@mui/icons-material/Cake';
import React, {useState} from "react";
import Link from "@mui/material/Link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {pushAnalytics} from "../helpers";
import { Trans } from 'react-i18next';


function DonateCard() {
    const url = process.env.REACT_APP_DONATE_URL;
    const [infoDialog, setInfoDialog] = useState(false);

    return <Card>
        <Dialog open={infoDialog} onClose={() => setInfoDialog(false)} fullWidth maxWidth="sm">
            <DialogTitle>Спасибо что вы с нами =)</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Typography>
                        Yandex Tracker Time Sheets был запущен <Tooltip title={"Если быть точными, то 28 октября 2022 года"}><Typography component="span" sx={{ textDecoration: 'underline' }}>в октябре 2022 года</Typography></Tooltip> и с тех пор постоянно развивается благодаря вашим отзывам и предложениям.
                    </Typography>
                    <Typography>
                        Мы рады, что вы активно им пользуетесь, и благодарим каждого за доверие и участие.
                    </Typography>
                    <Typography>
                        Портал был и останется бесплатным, а мы продолжим выпускать обновления! 🚀
                    </Typography>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Link href={url} target="_blank" rel="nofollow noopener" variant="button" underline="none" onClick={() => pushAnalytics("donate", { source: "dialog" })}>Подарить печеньку</Link>
                <Button onClick={() => setInfoDialog(false)}>Спасибо</Button>
            </DialogActions>
        </Dialog>

        <CardHeader
            avatar={
                <Avatar sx={{ bgcolor: "orange" }}>
                    <CakeIcon />
                </Avatar>
            }
            title={<React.Fragment>
                <Trans>Нам 2,5 года <Link href="#" onClick={() => { setInfoDialog(true); pushAnalytics("donateInfo"); }} underline={"none"}>^_^</Link></Trans>
            </React.Fragment>}
            subheader={<React.Fragment>
                <Link href={url} target="_blank" rel="nofollow noopener" onClick={() => pushAnalytics("donate", { source: "card" })}><Trans>На печеньки разработчикам</Trans></Link>
            </React.Fragment>}
        />
    </Card>
}

export default DonateCard;