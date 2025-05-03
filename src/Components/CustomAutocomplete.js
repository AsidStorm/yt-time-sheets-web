import React from "react";
import { Autocomplete, TextField } from "@mui/material";

function CustomAutocomplete({ options, onChange, value, label, disabled, renderOption }) {
    return (
        <Autocomplete
            options={options}
            onChange={onChange}
            value={value}
            disabled={disabled === true}
            isOptionEqualToValue={(option, value) => value && value.value === option.value}
            getOptionLabel={option => option.label}
            renderInput={props => <TextField {...props} fullWidth label={label} />}
            {...(renderOption ? { renderOption } : {})}
        />
    );
}

export default CustomAutocomplete;