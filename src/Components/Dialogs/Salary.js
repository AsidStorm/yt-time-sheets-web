import React, {Fragment, useEffect, useState} from "react";
import {
    Dialog,
    DialogTitle,
    Grid,
    DialogContent,
    TextField,
    Button,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableContainer,
    TableCell,
    TableBody, Tab, Alert
} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useSetAtom} from "jotai";
import {useMessage} from "../../hooks";
import {salaryMapAtom} from "../../jotai/atoms";
import {TabContext, TabList, TabPanel} from "@mui/lab";

const SALARY_MODE_IMPORT = "IMPORT";
const SALARY_MODE_MANUAL = "MANUAL";
const SALARY_MODEL_VIEW = "VIEW";
const SALARY_MODE_INPUT = "INPUT";

const SALARY_INPUT_TYPE_MANUAL = "MANUAL";
const SALARY_INPUT_TYPE_TEXT = "TEXT";

const SALARY_INPUT_TYPES = [
    SALARY_INPUT_TYPE_TEXT,
    SALARY_INPUT_TYPE_MANUAL,
];

export function DialogsSalary({state, handleClose, users, onApply}) {
    const {t} = useTranslation();

    const setSalaryMap = useSetAtom(salaryMapAtom);

    const { showError } = useMessage();

    const [mode, setMode] = useState(SALARY_MODE_INPUT);
    const [salaries, setSalaries] = useState({});
    const [isSimple, setIsSimple] = useState(false);
    const [inputType, setInputType] = useState(SALARY_INPUT_TYPE_TEXT);

    useEffect(() => {
        if (Object.keys(salaries).length > 0) {
            setMode(SALARY_MODEL_VIEW);
        }
    }, [state]);

    const handleSubmit = e => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        const csv = data.get("csv").trim();
        const rows = csv.split("\n");

        if (csv === "" || rows.length === 0) {
            return showError("Введите данные");
        }

        const isSimple = rows[0].split(";").length === 2;

        setIsSimple(isSimple);

        const out = {};

        const mapping = [];

        if (!isSimple) {
            const headers = rows.shift().split(";");

            headers.shift();

            for (const header of headers) {
                mapping.push(header);
            }
        }

        for (const row of rows) {
            if (isSimple) {
                const [userIdOrEmail, salary] = row.split(";");

                for (const user of users) {
                    if (parseInt(user.value) === parseInt(userIdOrEmail) || user.email === userIdOrEmail) {
                        out[parseInt(user.value)] = {
                            "*": parseInt(salary)
                        };
                    }
                }
            } else {
                const fields = row.split(";");
                const userIdOrEmail = fields.shift();

                const salary = {};

                for (const key in mapping) {
                    if (!mapping.hasOwnProperty(key)) {
                        continue;
                    }

                    salary[mapping[key]] = fields[key];
                }

                for (const user of users) {
                    if (parseInt(user.value) === parseInt(userIdOrEmail) || user.email === userIdOrEmail) {
                        out[parseInt(user.value)] = salary;
                    }
                }
            }
        }

        setSalaries(out);
        setMode(SALARY_MODEL_VIEW);
    };

    const userLabel = userId => {
        const user = users.find(u => parseInt(u.value) === parseInt(userId));
        return user.label;
    };

    const handleApplySubmit = event => {
        event.preventDefault();

        setSalaryMap(salaries);

        onApply();
    };

    const handleCancel = () => {
        setSalaries({});
        setMode(SALARY_MODE_IMPORT);
    };

    const handleSetInputType = (event, newValue) => {
        setInputType(newValue);
    };

    return <Dialog open={state} onClose={() => handleClose()} maxWidth="lg" fullWidth>
        <DialogTitle>{t('components:salary_dialog.title')}</DialogTitle>
        <DialogContent>
            {mode === SALARY_MODE_INPUT && <Fragment>
                <TabContext value={inputType}>
                    <TabList
                        variant="fullWidth"
                        onChange={handleSetInputType}
                    >
                        {SALARY_INPUT_TYPES.map(type => (
                            <Tab
                                key={`salary=input-type-${type}`}
                                value={type}
                                label={type}
                            />
                        ))}
                    </TabList>
                    <TabPanel
                        value={SALARY_INPUT_TYPE_TEXT}
                    >
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <Grid container spacing={2}>
                                <Grid size={{xs: 12}}>
                                    <Alert severity="info">
                                        Вставьте в поле ниже список пользователей ...
                                    </Alert>
                                </Grid>
                                <Grid size={{xs: 12}}>
                                    <TextField
                                        label={t('components:salary_dialog.fields.csv.label')}
                                        multiline
                                        fullWidth
                                        autoFocus
                                        rows={5}
                                        name="csv"
                                        variant="standard"
                                    />
                                </Grid>
                                <Grid size={{xs: 12}}>
                                    <Button fullWidth type="submit"
                                            color="success">{t('common:button.associate')}</Button>
                                </Grid>
                            </Grid>
                        </form>
                    </TabPanel>
                </TabContext>
            </Fragment>}
            {mode === SALARY_MODEL_VIEW && <form onSubmit={(e) => handleApplySubmit(e)}>
                <Grid container spacing={2}>
                    <Grid size={{xs: 12}}>
                        <Alert severity="info">
                            Проверьте правильность заполнения данных
                        </Alert>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <TableContainer component={Paper} sx={{maxHeight: 440}}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2}>
                                            {t('components:salary_dialog.table.header.user')}
                                        </TableCell>
                                        {isSimple && <TableCell align={`right`}>
                                            {t('components:salary_dialog.table.header.salary')}
                                        </TableCell>}
                                        {!isSimple && Object.keys(salaries[Object.keys(salaries)[0]]).map(value =>
                                            <TableCell key={`salary-header-${value}`} align={`right`}>
                                                {value}
                                            </TableCell>)}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(salaries).map(key => <TableRow key={key}>
                                        <TableCell>{key}</TableCell>
                                        <TableCell>{userLabel(key)}</TableCell>
                                        {!isSimple && Object.keys(salaries[Object.keys(salaries)[0]]).map(value =>
                                            <TableCell key={`salary-header-${key}-${value}`} align={`right`}>
                                                {salaries[key][value]}
                                            </TableCell>)}
                                        {isSimple && <TableCell align={`right`}>
                                            {salaries[key]['*']}
                                        </TableCell>}
                                    </TableRow>)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <Button fullWidth onClick={() => handleCancel()}
                                color="warning">{t('common:button.reset')}</Button>
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <Button fullWidth type="submit" color="success">{t('common:button.apply')}</Button>
                    </Grid>
                </Grid>
            </form>}
        </DialogContent>
    </Dialog>
}
