import React, { Fragment } from "react";
import {Card, CardHeader, Avatar, Link} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import {Trans, useTranslation} from "react-i18next";
import {pushAnalytics} from "../helpers";
import {COLOR_THEME_DARK} from "../constants";

function CopyrightCard() {
    const { t } = useTranslation();

    return <Card>
        <CardHeader
            avatar={
                <Avatar sx={{ backgroundColor: theme => theme.palette.mode === COLOR_THEME_DARK ? "lightgrey" : "black" }}>
                    <GitHubIcon />
                </Avatar>
            }
            title={<Fragment>
                <Link href="https://github.com/AsidStorm/yt-time-sheets-web" target="_blank" onClick={() => pushAnalytics("gitHubCLicked", { target: "web" })} rel="nofollow noopener">{t('copyright:web')}</Link> / <Link href="https://github.com/AsidStorm/yt-time-sheets-api" target="_blank" onClick={() => pushAnalytics("gitHubCLicked", { target: "api" })} rel="nofollow noopener">{t('copyright:api')}</Link>
            </Fragment>}
            subheader={<Trans
                i18nKey='copyright:description'
                components={{
                    partnerLink: <Link href="https://udpauto.ru/?utm_source=yt-time-sheets" target="_blank" rel="nofollow noopener" />
                }}
            />}
        />
    </Card>
}

export default CopyrightCard;