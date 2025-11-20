import React, {Fragment, useEffect, useState} from "react";
import {
    Button, Checkbox,
    FormControl,
    FormControlLabel, FormGroup,
    FormLabel,
    Grid,
    Radio,
    RadioGroup,
    Stack,
    TextField
} from "@mui/material";
import {DesktopDatePicker} from "@mui/x-date-pickers";
import {
    DATE_FORMAT_DATE, DATE_FORMAT_MONTH,
    FILTER_FAST_DATES,
    FILTER_FAST_DATES_LAST_2_DAYS, FILTER_FAST_DATES_LAST_30_DAYS,
    FILTER_FAST_DATES_LAST_7_DAYS, FILTER_FAST_DATES_LAST_90_DAYS,
    FILTER_FAST_DATES_TODAY, FILTER_FIELD_DATE_FORMAT,
    FILTER_FIELD_DATE_FROM, FILTER_FIELD_DATE_TO, FILTER_FIELD_HIDE_DETAILS, FILTER_FIELD_SHOULD_OPTIMIZE
} from "../../../constants";
import moment from "moment/moment";
import {generateMoments, pushAnalytics} from "../../../helpers";
import {useTranslation} from "react-i18next";
import {useAtom} from "jotai";
import {
    selectedDateFormat,
    selectedDateFromAtom,
    selectedDateToAtom, selectedHideDetailsAtom,
    selectedShouldOptimize
} from "../../../jotai/atoms";

export function DatesFilter() {
    const {t} = useTranslation();

    const [dateFormat, setDateFormat] = useAtom(selectedDateFormat);
    const [shouldOptimize, setShouldOptimize] = useAtom(selectedShouldOptimize);
    const [dateFrom, setDateFrom] = useAtom(selectedDateFromAtom);
    const [dateTo, setDateTo] = useAtom(selectedDateToAtom);
    const [hideDetails, setHideDetails] = useAtom(selectedHideDetailsAtom);

    const handleFastDateClick = value => {
        if (value === FILTER_FAST_DATES_TODAY) {
            setDateFrom(moment());
        } else if (value === FILTER_FAST_DATES_LAST_2_DAYS) {
            setDateFrom(moment().subtract(1, 'days'));
        } else if (value === FILTER_FAST_DATES_LAST_7_DAYS) {
            setDateFrom(moment().subtract(6, 'days'));
        } else if (value === FILTER_FAST_DATES_LAST_30_DAYS) {
            setDateFrom(moment().subtract(29, 'days'));
        } else if (value === FILTER_FAST_DATES_LAST_90_DAYS) {
            setDateFrom(moment().subtract(89, 'days'));
        }

        pushAnalytics('fastDateClick', {
            value
        });

        setDateTo(moment());
    };

    useEffect(() => {
        if (dateFrom.isValid() && dateTo.isValid()) {
            const dates = [...generateMoments(dateFrom, dateTo, moment.duration({days: 1}))];

            setShouldOptimize(dates.length > 31);
        }
    }, [dateFrom, dateTo]);

    return <Fragment>
        <Grid size={{xs: 12, md: 6}}>
            <FormControl fullWidth>
                <DesktopDatePicker
                    label={t('filter:date_from.label')}
                    value={dateFrom}
                    onChange={(newValue) => {
                        setDateFrom(newValue);
                    }}
                    disableFuture
                    maxDate={dateTo}
                    renderInput={(params) => <TextField {...params} />}
                />
            </FormControl>
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
            <FormControl fullWidth>
                <DesktopDatePicker
                    label={t('filter:date_to.label')}
                    value={dateTo}
                    onChange={(newValue) => {
                        setDateTo(newValue);
                    }}
                    disableFuture
                    minDate={dateFrom}
                    renderInput={(params) => <TextField {...params} />}
                />
            </FormControl>
        </Grid>
        <Grid size={{xs: 12}}>
            <Stack direction="row" spacing={1}>
                {FILTER_FAST_DATES.map(value => <Button variant="text" key={`fast_date_${value}`}
                                                        onClick={() => handleFastDateClick(value)}
                                                        size="small">
                    {t(`filter:fast_date.values.${value}`)}
                </Button>)}
            </Stack>
        </Grid>
        {shouldOptimize && <Fragment>
            <Grid size={{xs: 12}}>
                <FormControl fullWidth>
                    <FormLabel>{t('filter:date_display.label')}</FormLabel>
                    <RadioGroup row
                                value={dateFormat}
                                onChange={(e, newValue) => setDateFormat(newValue)}
                    >
                        <FormControlLabel value={DATE_FORMAT_DATE} control={<Radio/>}
                                          label={t(`filter:date_display.values.${DATE_FORMAT_DATE}`)}/>
                        <FormControlLabel value={DATE_FORMAT_MONTH} control={<Radio/>}
                                          label={t(`filter:date_display.values.${DATE_FORMAT_MONTH}`)}/>
                    </RadioGroup>
                </FormControl>
            </Grid>

            <Grid size={{xs: 12}}>
                <FormGroup>
                    <FormControlLabel control={<Checkbox/>} label={t('filter:hide_details.label')}
                                      checked={hideDetails} onChange={(e) => setHideDetails(e.target.checked)}/>
                </FormGroup>
            </Grid>

            <input type="hidden" name={FILTER_FIELD_SHOULD_OPTIMIZE} value="1" />
            <input type="hidden" name={FILTER_FIELD_DATE_FORMAT} value={dateFormat} />
            {hideDetails && <input type="hidden" name={FILTER_FIELD_HIDE_DETAILS} value="1" />}
        </Fragment>}

        <input type="hidden" name={FILTER_FIELD_DATE_FROM} value={dateFrom.format("YYYY-MM-DD")} />
        <input type="hidden" name={FILTER_FIELD_DATE_TO} value={dateTo.format("YYYY-MM-DD")} />
    </Fragment>
}