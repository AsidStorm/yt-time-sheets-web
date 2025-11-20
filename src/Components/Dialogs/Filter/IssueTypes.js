import React, {useEffect} from "react";
import {Autocomplete, Checkbox, Grid, TextField} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {useAtom, useAtomValue} from "jotai";
import {issueTypesAtom, selectedIssueTypesAtom} from "../../../jotai/atoms";
import {useTranslation} from "react-i18next";
import {FILTER_FIELD_ISSUE_TYPES} from "../../../constants";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

export function IssueTypesFilter() {
    const {t} = useTranslation();

    const issueTypes = useAtomValue(issueTypesAtom);
    const [selectedIssueTypes, setSelectedIssueTypes] = useAtom(selectedIssueTypesAtom);

    return <Grid size={{xs: 12}}>
        <Autocomplete
            multiple
            value={issueTypes.filter(value => selectedIssueTypes.includes(value.value))}
            onChange={(event, newInputValue) => {
                setSelectedIssueTypes(newInputValue.map(type => type.value));
            }}
            options={issueTypes}
            disableCloseOnSelect
            isOptionEqualToValue={(option, value) => value && value.value === option.value}
            getOptionLabel={option => option.label}
            renderOption={(props, option, {selected}) => (
                <li {...props} key={`filter-issue-type-${option.value}`}>
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
                <TextField {...params} label={t('filter:issue_types.label')}/>
            )}
        />

        <input type="hidden" value={selectedIssueTypes.join(",")} name={FILTER_FIELD_ISSUE_TYPES} />
    </Grid>
}