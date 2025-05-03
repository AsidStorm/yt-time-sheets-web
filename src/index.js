import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import {LocalizationProvider} from "@mui/x-date-pickers";
import './i18n';

import "moment/locale/ru";
import {Provider} from 'jotai';
import {useTranslation} from "react-i18next";

export const Providers = ({children}) => {
    const {i18n} = useTranslation();

    return (
        <Provider>
            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={i18n.language}>
                {children}
            </LocalizationProvider>
        </Provider>
    )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Providers>
        <App/>
    </Providers>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
