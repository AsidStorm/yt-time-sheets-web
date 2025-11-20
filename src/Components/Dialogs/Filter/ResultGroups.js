import React, {Fragment, useEffect, useState} from "react";
import {FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, TextField} from "@mui/material";
import {useAtomValue} from "jotai";
import {
    DATE_FORMAT_MONTH, FILTER_FIELD_HIGHLIGHT_TIME, FILTER_FIELD_RESULT_GROUPS,
    RESULT_GROUP_ISSUE,
    RESULT_GROUP_NONE,
    RESULT_GROUP_WORKER,
    RESULT_GROUPS
} from "../../../constants";
import {TimePicker} from "@mui/x-date-pickers";
import {renderTimeViewClock} from "@mui/x-date-pickers/timeViewRenderers";
import moment from "moment/moment";
import {useTranslation} from "react-i18next";
import {
    highlightTimeAtom,
    resultGroupsAtom,
    selectedDateFormat,
    selectedShouldOptimize
} from "../../../jotai/atoms";

export function ResultGroupsFilter() {
    const {t} = useTranslation();

    const dateFormat = useAtomValue(selectedDateFormat);
    const selectedResultGroups = useAtomValue(resultGroupsAtom);
    const shouldOptimize = useAtomValue(selectedShouldOptimize);
    const storedHighlightTime = useAtomValue(highlightTimeAtom);

    const [resultGroups, setResultGroups] = useState([RESULT_GROUP_ISSUE, RESULT_GROUP_NONE]);
    const [forceUpdate, setForceUpdate] = useState(false);
    const [highlightTime, setHighlightTime] = useState(null);

    useEffect(() => {
        if (highlightTime === null) {
            const date = moment();

            date.set('hour', 0);
            date.set('minute', 0);

            if( storedHighlightTime && storedHighlightTime > 0 ) {
                const hours = Math.floor(storedHighlightTime / 60);
                const minutes = storedHighlightTime % 60;

                date.set('hour', hours);
                date.set('minute', minutes);
            }

            setHighlightTime(date);
        }
    }, []);

    const updateResultGroups = (newValue, index) => {
        setResultGroups(prev => {
            prev[index] = newValue;

            if (newValue === RESULT_GROUP_NONE) {
                // Всё что после RESULT_GROUP_NONE - режем
                prev = prev.slice(0, index + 1);
            } else {
                // Если мы поменяли что-то в середине, надо посмотреть остаток. Если там что-то есть - режем на базе него
                const before = [];

                let keyFound = false;

                for (const key in prev) {
                    if (!prev.hasOwnProperty(key)) {
                        continue;
                    }

                    if (!keyFound) {
                        before.push(prev[key]);
                    } else {
                        if (before.includes(prev[key])) {
                            prev = prev.slice(0, parseInt(key));

                            break;
                        }
                    }

                    if (parseInt(key) === index) {
                        keyFound = true;
                    }
                }
            }

            if (prev[prev.length - 1] !== RESULT_GROUP_NONE) {
                prev.push(RESULT_GROUP_NONE);
            }

            return prev;
        });

        setForceUpdate(!forceUpdate);
    };

    useEffect(() => {
        setResultGroups(selectedResultGroups);
    }, []);

    return <Fragment>
        {RESULT_GROUPS.map((variants, index) => resultGroups[index] ?
            <Grid size={{xs: 12}} key={`result_groups-${index}`}>
                <FormControl>
                    <FormLabel>{t('filter:result_groups.label', {index: index + 1})}</FormLabel>
                    <RadioGroup row
                                value={resultGroups[index]}
                                onChange={(e, newValue) => updateResultGroups(newValue, index)}
                    >
                        {variants.map(value => (value === RESULT_GROUP_NONE || !resultGroups.slice(0, index).includes(value)) ?
                            <FormControlLabel value={value} control={<Radio/>}
                                              label={t(`filter:result_groups.values.${value}`)}
                                              name={`RESULT_GROUPS[]`}
                                              key={`RESULT_GROUPS-${index}-${value}`}/> : null)}
                    </RadioGroup>
                </FormControl>
            </Grid> : null)}

        {(resultGroups[0] === RESULT_GROUP_WORKER && (!shouldOptimize || dateFormat !== DATE_FORMAT_MONTH)) &&
            <Grid size={{xs: 12}}>
                <FormControl fullWidth>
                    <TimePicker
                        label={t('filter:highlight_time.label')}
                        value={highlightTime}
                        onChange={(newValue) => {
                            setHighlightTime(newValue);
                        }}
                        viewRenderers={{
                            hours: renderTimeViewClock,
                            minutes: renderTimeViewClock,
                            seconds: renderTimeViewClock,
                        }}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </FormControl>
            </Grid>}

        <input type="hidden" value={resultGroups.join(",")} name={FILTER_FIELD_RESULT_GROUPS} />
        {highlightTime && <input type="hidden" value={highlightTime.minute() + (highlightTime.hour() * 60)} name={FILTER_FIELD_HIGHLIGHT_TIME} />}
    </Fragment>
}