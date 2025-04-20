import IconButton from "@mui/material/IconButton";
import React, {Fragment, useState} from "react";
import {Avatar, Menu, MenuItem} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import {useTranslation} from "react-i18next";
import { deepPurple } from '@mui/material/colors';


export function LanguageSelector() {
    const { t, i18n } = useTranslation();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageSelect = language => {
        i18n.changeLanguage(language);
        localStorage.setItem('yt-time-sheets/locale', language);
        handleClose();
    };

    return <Fragment>
        <Tooltip title={`Выбор языка`}>
            <IconButton
                color="inherit"
                id="demo-positioned-button"
                aria-controls={open ? 'demo-positioned-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                <Avatar sx={{ bgcolor: deepPurple[100], width: 24, height: 24, fontSize: '13px' }}>{i18n.language.toUpperCase()}</Avatar>
            </IconButton>
        </Tooltip>
        <Menu
            id="demo-positioned-menu"
            aria-labelledby="demo-positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <MenuItem onClick={() => handleLanguageSelect('ru')}>
                {t('common:language.russian')}
            </MenuItem>
            <MenuItem onClick={() => handleLanguageSelect('en')}>
                {t('common:language.english')}
            </MenuItem>
        </Menu>
    </Fragment>
}