import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React, {useEffect, useState} from "react";
import {DATE_FORMAT, DATE_FORMAT_DATE, TIME_FORMAT_HOURS, TIME_FORMAT_MINUTES} from "../constants";
import {humanizeDuration} from "../helpers";
import Typography from "@mui/material/Typography";
import moment from "moment";

import { Chart as ChartJS, registerables } from 'chart.js';

import { Pie, Bar } from 'react-chartjs-2';
import Alert from "@mui/material/Alert";

ChartJS.register(...registerables);

function ChartsDialog({state, dateFormat, handleClose, workLogs, timeFormat, dates}) {
    const [ charts, setCharts ] = useState([]);

    const durationValueFormatter = value => {
        const tf = [TIME_FORMAT_HOURS, TIME_FORMAT_MINUTES].includes(timeFormat) ? timeFormat : TIME_FORMAT_HOURS;

        if( parseInt(value) === value ) {
            return humanizeDuration(value, tf);
        }

        if( parseInt(value.parsed) > 0 ) {
            return humanizeDuration(value.parsed, tf);
        }

        if( parseInt(value.raw) > 0 ) {
            return humanizeDuration(value.raw, tf);
        }

        return humanizeDuration(0, tf);
    };

    const prepareCharts = () => {
        const out = [];

        const pieChartByUsers = {};
        const pieChartByIssues = {};
        const pieChartByDate = {};
        const pieChartByQueue = {};
        const pieChartByEpic = {};
        const pieChartByProject = {};
        const pieChartByIssueType = {};

        const barChartByUsersAndDate = {}; // USERID => DATE
        const barChartByQueueAndDate = {}; // QUEUE => DATE
        const barChartByIssueAndDate = {};
        const barChartByEpicAndDate = {};
        const barChartByProjectAndDate = {};
        const barChartByIssueTypeAndDate = {};

        const users = {};

        const workLogEpic = ({ epicKey, epicDisplay }) => {
            if( epicKey === "" ) {
                return { epicKey: "NO_EPIC", epicTitle: "Нет" };
            }

            return { epicKey, epicTitle: epicDisplay };
        };

        const workLogProject = ({ projectId, projectName }) => {
            if( projectId === "" || projectId === "0" ) {
                return { projectId: "-1", projectName: "Нет" };
            }

            return { projectId, projectName };
        };

        for (const log of workLogs) {
            const date = dateFormat === DATE_FORMAT_DATE ? moment(log.createdAt).format(DATE_FORMAT) : moment(log.createdAt).format("MM.YYYY");

            const { projectId, projectName } = workLogProject(log);
            const { epicKey, epicTitle } = workLogEpic(log);

            if( !users[log.createdById] ) {
                users[log.createdById] = log.createByDisplay;
            }

            if (!pieChartByUsers[log.createdById]) {
                pieChartByUsers[log.createdById] = {id: log.createdById, label: log.createByDisplay, value: 0}
            }

            if( !pieChartByProject[projectId] ) {
                pieChartByProject[projectId] = {id: projectId, label: projectName, value: 0 };
            }

            if( !pieChartByIssueType[log.typeId] ) {
                pieChartByIssueType[log.typeId] = {id: log.typeId, label: log.typeDisplay, value: 0 };
            }

            if( !barChartByUsersAndDate[log.createdById] ) {
                barChartByUsersAndDate[log.createdById] = {
                    label: log.createByDisplay,
                    data: {}
                };

                for( const originalDate of dates ) {
                    barChartByUsersAndDate[log.createdById].data[originalDate.index] = 0;
                }
            }

            if( !barChartByProjectAndDate[projectId] ) {
                barChartByProjectAndDate[projectId] = {
                    label: projectName,
                    data: {}
                };

                for( const originalDate of dates ) {
                    barChartByProjectAndDate[projectId].data[originalDate.index] = 0;
                }
            }

            if( !barChartByQueueAndDate[log.queue] ) {
                barChartByQueueAndDate[log.queue] = {
                    label: log.queue,
                    data: {}
                };

                for( const originalDate of dates ) {
                    barChartByQueueAndDate[log.queue].data[originalDate.index] = 0;
                }
            }

            if( !barChartByIssueAndDate[log.issueKey] ) {
                barChartByIssueAndDate[log.issueKey] = {
                    label: log.issueKey + ": " + log.issueDisplay,
                    data: {}
                };

                for( const originalDate of dates ) {
                    barChartByIssueAndDate[log.issueKey].data[originalDate.index] = 0;
                }
            }

            if( !barChartByEpicAndDate[epicKey] ) {
                barChartByEpicAndDate[epicKey] = {
                    label: epicKey === "NO_EPIC" ? "Нет" : (epicKey + ": " + epicTitle),
                    data: {}
                };

                for( const originalDate of dates ) {
                    barChartByEpicAndDate[epicKey].data[originalDate.index] = 0;
                }
            }

            if( !barChartByIssueTypeAndDate[log.typeId] ) {
                barChartByIssueTypeAndDate[log.typeId] = {
                    label: log.typeDisplay,
                    data: {}
                };

                for( const originalDate of dates ) {
                    barChartByIssueTypeAndDate[log.typeId].data[originalDate.index] = 0;
                }
            }

            if( !pieChartByEpic[epicKey] ) {
                pieChartByEpic[epicKey] = {
                    id: epicKey,
                    label: epicKey === "NO_EPIC" ? "Нет" : (epicKey + ": " + epicTitle),
                    value: 0
                }
            }

            if (!pieChartByIssues[log.issueKey]) {
                pieChartByIssues[log.issueKey] = {
                    id: log.issueKey,
                    label: log.issueKey + ": " + log.issueDisplay,
                    value: 0
                }
            }

            if (!pieChartByDate[date]) {
                pieChartByDate[date] = {id: date, label: date, value: 0}
            }

            if (!pieChartByQueue[log.queue]) {
                pieChartByQueue[log.queue] = {id: log.queue, label: log.queue, value: 0}
            }

            pieChartByUsers[log.createdById].value += log.duration;
            pieChartByIssues[log.issueKey].value += log.duration;
            pieChartByEpic[epicKey].value += log.duration;
            pieChartByDate[date].value += log.duration;
            pieChartByQueue[log.queue].value += log.duration;
            pieChartByProject[projectId].value += log.duration;
            pieChartByIssueType[log.typeId].value += log.duration;

            barChartByUsersAndDate[log.createdById].data[date] += log.duration;
            barChartByQueueAndDate[log.queue].data[date] += log.duration;
            barChartByIssueAndDate[log.issueKey].data[date] += log.duration;
            barChartByEpicAndDate[epicKey].data[date] += log.duration;
            barChartByProjectAndDate[projectId].data[date] += log.duration;
            barChartByIssueTypeAndDate[log.typeId].data[date] += log.duration;
        }

        if( Object.keys(pieChartByUsers).length > 1 ) {
            out.push({
                type: "PIE",
                label: "Итого (Сотрудники)",
                md: 6,
                data: {
                    labels: Object.values(pieChartByUsers).map( v => v.label ),
                    datasets: [
                        {
                            data: Object.values(pieChartByUsers),
                        },
                    ]
                },

                options: {
                    plugins: {
                        legend: {
                            position: "right",
                        },
                        tooltip: {
                            callbacks: {
                                label: durationValueFormatter
                            }
                        }
                    }
                },
            });
        }

        if( Object.keys(pieChartByIssues).length > 1 ) {
            out.push({
                type: "PIE",
                label: "Итого (Задачи)",
                md: 6,
                data: {
                    labels: Object.values(pieChartByIssues).map( v => v.label ),
                    datasets: [
                        {
                            data: Object.values(pieChartByIssues),
                        },
                    ]
                },

                options: {
                    plugins: {
                        legend: {
                            position: "right",
                        },
                        tooltip: {
                            callbacks: {
                                label: durationValueFormatter
                            }
                        }
                    }
                },
            });
        }

        if( Object.keys(pieChartByQueue).length > 1 ) {
            out.push({
                type: "PIE",
                label: "Итого (Очереди)",
                md: 6,
                data: {
                    labels: Object.values(pieChartByQueue).map( v => v.label ),
                    datasets: [
                        {
                            data: Object.values(pieChartByQueue),
                        },
                    ]
                },

                options: {
                    plugins: {
                        legend: {
                            position: "right",
                        },
                        tooltip: {
                            callbacks: {
                                label: durationValueFormatter
                            }
                        }
                    }
                },
            });
        }

        if( Object.keys(pieChartByIssueType).length > 1 ) {
            out.push({
                type: "PIE",
                label: "Итого (Типы задач)",
                md: 6,
                data: {
                    labels: Object.values(pieChartByIssueType).map( v => v.label ),
                    datasets: [
                        {
                            data: Object.values(pieChartByIssueType),
                        },
                    ]
                },

                options: {
                    plugins: {
                        legend: {
                            position: "right",
                        },
                        tooltip: {
                            callbacks: {
                                label: durationValueFormatter
                            }
                        }
                    }
                },
            });
        }

        if( Object.keys(pieChartByEpic).length > 1 ) {
            out.push({
                type: "PIE",
                label: "Итого (Эпики)",
                md: 6,
                data: {
                    labels: Object.values(pieChartByEpic).map( v => v.label ),
                    datasets: [
                        {
                            data: Object.values(pieChartByEpic),
                        },
                    ]
                },

                options: {
                    plugins: {
                        legend: {
                            position: "right",
                        },
                        tooltip: {
                            callbacks: {
                                label: durationValueFormatter
                            }
                        }
                    }
                },
            });
        }

        if( Object.keys(pieChartByProject).length > 1 ) {
            out.push({
                type: "PIE",
                label: "Итого (Проекты)",
                md: 6,
                data: {
                    labels: Object.values(pieChartByProject).map( v => v.label ),
                    datasets: [
                        {
                            data: Object.values(pieChartByProject),
                        },
                    ]
                },

                options: {
                    plugins: {
                        legend: {
                            position: "right",
                        },
                        tooltip: {
                            callbacks: {
                                label: durationValueFormatter
                            }
                        }
                    }
                },
            });
        }

        if( Object.keys(barChartByUsersAndDate).length > 1 || dates.length > 1 ) {
            out.push({
                type: "BAR_STACKED",
                label: "По дням (Сотрудники)",

                md: 12,

                data: {
                    labels: dates.map( d => d.title ),
                    datasets: Object.keys(barChartByUsersAndDate).map( key => {
                        return {
                            label: users[key],
                            data: Object.values(barChartByUsersAndDate[key].data),
                            stack: "stack-o"
                        }
                    })
                },

                options: {
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,

                            ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value, index, ticks) {
                                    return durationValueFormatter(value);
                                }
                            }
                        }
                    },

                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: value => {
                                    return value.dataset.label + ": " + durationValueFormatter(value);
                                }
                            }
                        }
                    }
                }
            });
        }

        if( Object.keys(barChartByQueueAndDate).length > 1 || dates.length > 1 ) {
            out.push({
                type: "BAR_STACKED",
                label: "По дням (Очереди)",

                md: 12,

                data: {
                    labels: dates.map( d => d.title),
                    datasets: Object.keys(barChartByQueueAndDate).map( key => {
                        return {
                            label: barChartByQueueAndDate[key].label,
                            data: Object.values(barChartByQueueAndDate[key].data),
                            stack: "stack-o"
                        }
                    })
                },

                options: {
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,

                            ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value, index, ticks) {
                                    return durationValueFormatter(value);
                                }
                            }
                        }
                    },

                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: value => {
                                    return value.dataset.label + ": " + durationValueFormatter(value);
                                }
                            }
                        }
                    }
                }
            });
        }

        if( Object.keys(barChartByIssueAndDate).length > 1 || dates.length > 1 ) {
            out.push({
                type: "BAR_STACKED",
                label: "По дням (Задачи)",

                md: 12,

                data: {
                    labels: dates.map( d => d.title),
                    datasets: Object.keys(barChartByIssueAndDate).map( key => {
                        return {
                            label: barChartByIssueAndDate[key].label,
                            data: Object.values(barChartByIssueAndDate[key].data),
                            stack: "stack-o"
                        }
                    })
                },

                options: {
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,

                            ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value, index, ticks) {
                                    return durationValueFormatter(value);
                                }
                            }
                        }
                    },

                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: value => {
                                    return value.dataset.label + ": " + durationValueFormatter(value);
                                }
                            }
                        }
                    }
                }
            });
        }

        if( Object.keys(barChartByProjectAndDate).length > 1 || dates.length > 1 ) {
            out.push({
                type: "BAR_STACKED",
                label: "По дням (Проекты)",

                md: 12,

                data: {
                    labels: dates.map( d => d.title),
                    datasets: Object.keys(barChartByProjectAndDate).map( key => {
                        return {
                            label: barChartByProjectAndDate[key].label,
                            data: Object.values(barChartByProjectAndDate[key].data),
                            stack: "stack-o"
                        }
                    })
                },

                options: {
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,

                            ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value, index, ticks) {
                                    return durationValueFormatter(value);
                                }
                            }
                        }
                    },

                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: value => {
                                    return value.dataset.label + ": " + durationValueFormatter(value);
                                }
                            }
                        }
                    }
                }
            });
        }

        if( Object.keys(barChartByIssueTypeAndDate).length > 1 || dates.length > 1 ) {
            out.push({
                type: "BAR_STACKED",
                label: "По дням (Типы задач)",

                md: 12,

                data: {
                    labels: dates.map( d => d.title),
                    datasets: Object.keys(barChartByIssueTypeAndDate).map( key => {
                        return {
                            label: barChartByIssueTypeAndDate[key].label,
                            data: Object.values(barChartByIssueTypeAndDate[key].data),
                            stack: "stack-o"
                        }
                    })
                },

                options: {
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,

                            ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value, index, ticks) {
                                    return durationValueFormatter(value);
                                }
                            }
                        }
                    },

                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: value => {
                                    return value.dataset.label + ": " + durationValueFormatter(value);
                                }
                            }
                        }
                    }
                }
            });
        }

        if( Object.keys(barChartByEpicAndDate).length > 1 || dates.length > 1 ) {
            out.push({
                type: "BAR_STACKED",
                label: "По дням (Эпики)",

                md: 12,

                data: {
                    labels: dates.map( d => d.title),
                    datasets: Object.keys(barChartByEpicAndDate).map( key => {
                        return {
                            label: barChartByEpicAndDate[key].label,
                            data: Object.values(barChartByEpicAndDate[key].data),
                            stack: "stack-o"
                        }
                    })
                },

                options: {
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true,

                            ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value, index, ticks) {
                                    return durationValueFormatter(value);
                                }
                            }
                        }
                    },

                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: value => {
                                    return value.dataset.label + ": " + durationValueFormatter(value);
                                }
                            }
                        }
                    }
                }
            });
        }

        setCharts(out);
    };

    useEffect(() => {
        prepareCharts();
    }, [workLogs]);

    return <Dialog open={state} onClose={() => handleClose()} fullWidth maxWidth="lg">
        <DialogTitle>Графики</DialogTitle>
        <DialogContent>
            <Grid container spacing={2} sx={{paddingTop: 2}}>
                {charts.length === 0 && <Grid item xs={12}><Alert severity="warning">Недостаточно данных для построения графиков!</Alert></Grid>}
                {charts.map(chart => <Grid item xs={12} md={chart.md} style={{height: 500 + `px`, marginBottom: 20 + `px`}} key={chart.label}>
                    <Typography sx={{ml: 2, flex: 1}} variant="h5" component="div">
                        {chart.label}
                    </Typography>

                    {chart.type === "PIE" && <Pie
                        data={chart.data}
                        options={chart.options}
                    />}

                    {chart.type === "BAR_STACKED" && <Bar
                        data={chart.data}
                        options={chart.options}
                    />}
                </Grid>)}
            </Grid>
        </DialogContent>

        <DialogActions>
            <Button onClick={() => handleClose()} color="warning">Закрыть</Button>
        </DialogActions>
    </Dialog>
}

export default ChartsDialog;