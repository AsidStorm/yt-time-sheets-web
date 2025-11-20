import React, {Fragment} from "react";
import {Autocomplete, Checkbox, FormControl, Grid, TextField} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {useAtom, useAtomValue} from "jotai";
import {
    issueStatusesAtom,
    selectedIssueStatusesAtom, selectedMonthAtom
} from "../../../jotai/atoms";
import {useTranslation} from "react-i18next";
import {DesktopDatePicker} from "@mui/x-date-pickers";
import {
    FILTER_FIELD_ISSUE_STATUSES,
    FILTER_FIELD_MOVED_TO_STATUS_MONTH, FILTER_FIELD_MOVED_TO_STATUS_YEAR
} from "../../../constants";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

export function MovedToStatusesFilter() {
    const {t} = useTranslation();

    const issueStatuses = useAtomValue(issueStatusesAtom);
    const [selectedIssueStatuses, setSelectedIssueStatuses] = useAtom(selectedIssueStatusesAtom);
    const [movedToStatusMonth, setMovedToStatusMonth] = useAtom(selectedMonthAtom);

    return <Fragment>
        <Grid size={{xs: 12, md: 6}}>
            <Autocomplete
                multiple
                value={issueStatuses.filter(value => selectedIssueStatuses.includes(value.value))}
                onChange={(event, newInputValue) => {
                    setSelectedIssueStatuses(newInputValue.map(type => type.value));
                }}
                options={issueStatuses}
                disableCloseOnSelect
                isOptionEqualToValue={(option, value) => value && value.value === option.value}
                getOptionLabel={option => option.label}
                renderOption={(props, option, {selected}) => (
                    <li {...props} key={`filter-issue-status-${option.value}`}>
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
                    <TextField {...params} label={t('filter:status.label')}/>
                )}
            />
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
            <FormControl fullWidth>
                <DesktopDatePicker
                    label={t('filter:month.label')}
                    inputFormat="MM.YYYY"
                    value={movedToStatusMonth}
                    onChange={(newValue) => {
                        setMovedToStatusMonth(newValue);
                    }}
                    disableFuture
                    views={['month', 'year']}
                    renderInput={(params) => <TextField {...params} />}
                />
            </FormControl>
        </Grid>

        <input type="hidden" value={selectedIssueStatuses.join(",")} name={FILTER_FIELD_ISSUE_STATUSES} />
        <input type="hidden" value={movedToStatusMonth.format("MM")} name={FILTER_FIELD_MOVED_TO_STATUS_MONTH} />
        <input type="hidden" value={movedToStatusMonth.format("YYYY")} name={FILTER_FIELD_MOVED_TO_STATUS_YEAR} />
    </Fragment>
}