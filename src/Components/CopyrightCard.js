import {Card, CardHeader} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import GitHubIcon from "@mui/icons-material/GitHub";
import React from "react";
import Link from "@mui/material/Link";

function CopyrightCard() {
    return <Card>
        <CardHeader
            avatar={
                <Avatar sx={{ bgcolor: "black" }}>
                    <GitHubIcon />
                </Avatar>
            }
            title={<React.Fragment>
                <Link href="https://github.com/AsidStorm/yt-time-sheets-web" target="_blank" rel="nofollow noopener">web</Link> / <Link href="https://github.com/AsidStorm/yt-time-sheets-api" target="_blank" rel="nofollow noopener">api</Link>
            </React.Fragment>}
            subheader={<React.Fragment>
                При поддержке <Link href="https://udpauto.ru/?utm_source=yt-time-sheets" target="_blank" rel="nofollow noopener">UDP Auto</Link>
            </React.Fragment>}
        />
    </Card>
}

export default CopyrightCard;