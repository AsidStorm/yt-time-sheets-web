import React, {Fragment, useEffect} from "react";
import {Autocomplete, Button, Checkbox, Grid, TextField} from "@mui/material";
import {useTranslation} from "react-i18next";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {useAtom, useAtomValue} from "jotai";
import {projectsAtom, selectedProjectsAtom} from "../../../jotai/atoms";
import {FILTER_FIELD_PROJECTS} from "../../../constants";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

export function ProjectsFilter() {
    const {t} = useTranslation();

    const projects = useAtomValue(projectsAtom);
    const [selectedProjects, setSelectedProjects] = useAtom(selectedProjectsAtom);

    return <Fragment>
        <Grid size={{xs: 12, md: 9}}>
            <Autocomplete
                multiple
                value={projects.filter(value => selectedProjects.includes(value.value))}
                onChange={(event, newInputValue) => {
                    setSelectedProjects(newInputValue.map(queue => queue.value));
                }}
                options={projects}
                disableCloseOnSelect
                isOptionEqualToValue={(option, value) => value && value.value === option.value}
                getOptionLabel={option => option.label}
                renderOption={(props, option, {selected}) => (
                    <li {...props} key={`filter-project-${option.value}`}>
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
                    <TextField {...params} label={t('filter:projects.label')}/>
                )}
            />
        </Grid>

        <Grid size={{xs: 12, md: 3}}>
            <Button variant="outlined" size="large" fullWidth
                    onClick={() => setSelectedProjects(projects.map(p => p.value))}>
                {t('common:button.all_projects')}
            </Button>
        </Grid>

        <input type="hidden" value={selectedProjects.join(",")} name={FILTER_FIELD_PROJECTS} />
    </Fragment>
}