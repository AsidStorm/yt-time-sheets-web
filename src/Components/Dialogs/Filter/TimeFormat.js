import React, {useEffect, useState} from "react";
import {FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup} from "@mui/material";
import {FILTER_FIELD_TIME_FORMAT, TIME_FORMAT_HOURS, TIME_FORMATS} from "../../../constants";
import {useTranslation} from "react-i18next";
import {useAtomValue} from "jotai";
import {timeFormatAtom} from "../../../jotai/atoms";

export function TimeFormatFilter() {
    const {t} = useTranslation();

    const [timeFormat, setTimeFormat] = useState(TIME_FORMAT_HOURS);
    const selectedTimeFormat = useAtomValue(timeFormatAtom);

    useEffect(() => {
        setTimeFormat(selectedTimeFormat);
    }, []);

    return <Grid size={{xs: 12, md: 6}}>
        <FormControl fullWidth>
            <FormLabel>{t('filter:time_format.label')}</FormLabel>
            <RadioGroup row
                        value={timeFormat}
                        onChange={(e, newValue) => setTimeFormat(newValue)}
            >
                {TIME_FORMATS.map(format => <FormControlLabel value={format} key={`time-formats-${format}`}
                                                              control={<Radio name={FILTER_FIELD_TIME_FORMAT} />}
                                                              label={t(`filter:time_format.values.${format}`)}/>)}
            </RadioGroup>
        </FormControl>
    </Grid>
}