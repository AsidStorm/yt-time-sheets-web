import Autocomplete from "@mui/material/Autocomplete";
import React from "react";
import TextField from "@mui/material/TextField";

function CustomAutocomplete({ options, onChange, value, label, disabled }) {
    return (
        <Autocomplete
            options={options}
            onChange={onChange}
            value={value}
            disabled={disabled === true}
            isOptionEqualToValue={(option, value) => value && value.value === option.value}
            getOptionLabel={option => option.label}
            renderInput={props => <TextField {...props} fullWidth label={label} />}
        />
    );
}

export default CustomAutocomplete;