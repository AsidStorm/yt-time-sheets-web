import React, {useEffect} from "react";
import {useAtom, useAtomValue} from "jotai";
import {queuesAtom, selectedQueuesAtom} from "../../../jotai/atoms";
import {Autocomplete, Checkbox, Grid, TextField} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {useTranslation} from "react-i18next";
import {FILTER_FIELD_QUEUES} from "../../../constants";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

export function QueuesFilter() {
    const {t} = useTranslation();

    const queues = useAtomValue(queuesAtom);
    const [selectedQueues, setSelectedQueues] = useAtom(selectedQueuesAtom);

    return <Grid size={{xs: 12}}>
        <Autocomplete
            multiple
            value={queues.filter(value => selectedQueues.includes(value.value))}
            onChange={(event, newInputValue) => {
                setSelectedQueues(newInputValue.map(queue => queue.value));
            }}
            options={queues}
            disableCloseOnSelect
            isOptionEqualToValue={(option, value) => value && value.value === option.value}
            getOptionLabel={option => option.label}
            renderOption={(props, option, {selected}) => (
                <li {...props} key={`filter-queue-${option.value}`}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{marginRight: 8}}
                        checked={selected}
                    />
                    {option.label}
                </li>
            )}
            renderInput={(params) => (
                <TextField {...params} label={t('filter:queues.label')}/>
            )}
        />

        <input type="hidden" value={selectedQueues.join(",")} name={FILTER_FIELD_QUEUES} />
    </Grid>
}