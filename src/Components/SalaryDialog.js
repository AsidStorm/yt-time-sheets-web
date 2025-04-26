import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogTitle,
    Grid2 as Grid,
    DialogContent,
    TextField,
    Button,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableContainer,
    TableCell,
    TableBody,
    FormControl,
    Checkbox,
    FormControlLabel,
    FormGroup
} from "@mui/material";
import {TimePicker} from "@mui/x-date-pickers";
import {useTranslation} from "react-i18next";
import {useSalaryState} from "../Context/Salary";
import {useMessage} from "../hooks";

const SALARY_MODE_IMPORT = "IMPORT";
const SALARY_MODEL_VIEW = "VIEW";

function SalaryDialog({state, handleClose, users, onApply}) {
    const {t} = useTranslation();

    const { showError } = useMessage();

    const [mode, setMode] = useState(SALARY_MODE_IMPORT);
    const [salaries, setSalaries] = useState({});
    const [isSimple, setIsSimple] = useState(false);

    const [globalSalaries, setGlobalSalaries] = useSalaryState();

    const [spreadUnmarkedTime, setSpreadUnmarkedTime] = useState(false);
    const [mustWorkedTime, setMustWorkedTime] = useState(null);

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

    const handleApplySubmit = (e) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        setGlobalSalaries(salaries);

        //onApply({salaries, spreadUnmarkedTime, mustWorkedTime, weekendsMultiplier: parseFloat(data.get('weekendsMultiplier').replace(",", ".")), overtimeMultiplier: parseFloat(data.get('overtimeMultiplier').replace(",", ""))});
        onApply();
    };

    const handleCancel = () => {
        setSalaries({});
        setMode(SALARY_MODE_IMPORT);
    };

    return <Dialog open={state} onClose={() => handleClose()} maxWidth="lg" fullWidth>
        <DialogTitle>{t('components:salary_dialog.title')}</DialogTitle>
        <DialogContent>
            {mode === SALARY_MODE_IMPORT && <form onSubmit={(e) => handleSubmit(e)}>
                <Grid container spacing={2} sx={{paddingTop: 2}}>
                    <Grid size={{xs: 12}}>
                        <TextField
                            label={t('components:salary_dialog.fields.csv.label')}
                            multiline
                            fullWidth
                            rows={5}
                            name="csv"
                            variant="standard"
                        />
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <Button fullWidth type="submit" color="success">{t('common:button.associate')}</Button>
                    </Grid>
                </Grid>
            </form>}
            {mode === SALARY_MODEL_VIEW && <form onSubmit={(e) => handleApplySubmit(e)}>
                <Grid container spacing={2} sx={{paddingTop: 2}}>
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
                    {false && <Grid size={{xs: 12}}>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox/>} label="Распределить неотмеченное время по задачам"
                                              checked={spreadUnmarkedTime}
                                              onChange={(e) => setSpreadUnmarkedTime(e.target.checked)}/>
                        </FormGroup>
                    </Grid>}
                    {spreadUnmarkedTime && <Grid size={{xs: 12}}>
                        <FormControl fullWidth>
                            <TimePicker
                                label={t('components:salary_dialog.fields.must_worked_time.label')}
                                value={mustWorkedTime}
                                onChange={(newValue) => {
                                    setMustWorkedTime(newValue);
                                }}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </FormControl>
                    </Grid>}
                    {false && <Grid size={{xs: 12}}>
                        <TextField
                            margin="dense"
                            label="Мультипликатор стоимости в выходные"
                            fullWidth
                            type="number"
                            name="weekendsMultiplier"
                            variant="standard"
                            defaultValue={2}
                        />
                    </Grid>}
                    {false && <Grid size={{xs: 12}}>
                        <TextField
                            margin="dense"
                            label="Мультипликатор овертайма в будние дни"
                            fullWidth
                            type="number"
                            name="overtimeMultiplier"
                            variant="standard"
                            defaultValue={1.5}
                        />
                    </Grid>}
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

export default SalaryDialog;
