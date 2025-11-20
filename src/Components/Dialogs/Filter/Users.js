import React, {Fragment, useEffect, useState} from "react";
import {Button, Checkbox, Grid, TextField, Autocomplete, Stack} from "@mui/material";
import {pushAnalytics} from "../../../helpers";
import {useAtomValue} from "jotai";
import {groupsAtom, myUserAtom, orderedGroupsAtom, selectedUsersAtom, usersAtom} from "../../../jotai/atoms";
import {useTranslation} from "react-i18next";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {useGroupsDialog} from "../../../hooks";
import {FILTER_FIELD_USERS} from "../../../constants";
import {DialogsGroups} from "../Groups";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

export function UsersFilter() {
    const {t} = useTranslation();

    const {open: openGroupsDialog} = useGroupsDialog();

    const myUser = useAtomValue(myUserAtom);
    const users = useAtomValue(usersAtom);
    const groups = useAtomValue(groupsAtom);
    const orderedGroups = useAtomValue(orderedGroupsAtom);

    const storedSelectedUsers = useAtomValue(selectedUsersAtom);

    const favoriteGroups = orderedGroups.filter( group => group.isFavorite );

    const [selectedUsers, setSelectedUsers] = useState([]);

    const handleFastGroupSelection = group => {
        setSelectedUsers(group.members.map(memberId => String(memberId)));

        pushAnalytics('fastGroupSelected');
    };

    const handleGroupSelected = group => {
        setSelectedUsers(group.members.map(memberId => String(memberId)));
    };

    const handleGroupsButtonClick = () => {
        openGroupsDialog();

        pushAnalytics('groupsButtonClick', {groupsCount: groups.length});
    };

    useEffect(() => {
        setSelectedUsers(storedSelectedUsers);
    }, []);

    return <Fragment>
        <DialogsGroups onSelect={handleGroupSelected} />

        <Grid size={{xs: 12, md: 9}}>
            <Autocomplete
                multiple
                value={users.filter(value => selectedUsers.includes(String(value.value)))}
                onChange={(event, newInputValue) => {
                    setSelectedUsers(newInputValue.map(user => String(user.value)));
                }}
                options={users}
                disableCloseOnSelect
                isOptionEqualToValue={(option, value) => value && value.value === option.value}
                getOptionLabel={option => option.label}
                renderOption={(props, option, {selected}) => (
                    <li {...props} key={`filter-user-${option.value}`}>
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
                    <TextField {...params} label={t('filter:users.label')}/>
                )}
            />
            {favoriteGroups.length > 0 && <Stack direction="row" spacing={1} sx={{pt:1}}>
                {favoriteGroups.map(group => <Button variant="text" key={`favorite-group-${group.value}`}
                                                     onClick={() => handleFastGroupSelection(group)}
                                                     size="small">
                    {group.label}
                </Button>)}
            </Stack>}
        </Grid>

        <Grid size={{xs: 12, md: 3}}>
            {groups.length > 0 && <Button variant="outlined" size="large" fullWidth onClick={() => handleGroupsButtonClick()} sx={{mb: 1}}>
                {t('common:button.choose_group')}
            </Button>}
            {!!myUser.value && <Button variant="outlined" size="large" fullWidth
                                       onClick={() => setSelectedUsers([myUser.value])}>
                {t('common:button.choose_myself')}
            </Button>}
        </Grid>

        <input type="hidden" value={selectedUsers.join(",")} name={FILTER_FIELD_USERS} />
    </Fragment>
}