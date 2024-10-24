import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import {LocalizationProvider} from "@mui/x-date-pickers";
import {SalaryProvider} from "./Context/Salary";

import "moment/locale/ru";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <SalaryProvider>
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={"ru"}>
            <App/>
        </LocalizationProvider>
    </SalaryProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
