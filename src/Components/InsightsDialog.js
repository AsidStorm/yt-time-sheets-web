import React, {useEffect, useState} from "react";
import {Dialog, DialogTitle, Grid2 as Grid, Container, Avatar, Tooltip, Typography, Link} from "@mui/material";
import {
    RESULT_GROUP_WORKER,
    TIME_FORMAT_HOURS
} from "../constants";
import {Card, CardContent, CardHeader} from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import {red} from "@mui/material/colors";
import {humanizeDuration, yandexTrackerIssueUrl, yandexTrackerQueueUrl} from "../helpers";
import {Chart as ChartJS, registerables} from 'chart.js';
import {Pie, Bar} from 'react-chartjs-2';
import {useTranslation} from "react-i18next";
import {useInsightsDialog} from "../hooks";
import {useAtomValue} from "jotai";
import {resultRowsAtom} from "../jotai/atoms";

ChartJS.register(...registerables);

const numberValueFormatter = value => value;
const timeValueFormatter = timeFormat => value => humanizeDuration(value, timeFormat);

const buildComparison = (valueFormatter) => (data, userValue) => {
    const result = {
        greater: [],
        same: [],
        less: []
    };

    /*const valueFormatter = value => {
        return value;
    };*/

    const labelFormatter = () => {

    };

    ['greater', 'same', 'less'].forEach(group => {
        Object.entries(data[group]).forEach(([key, item]) => {
            const diff = userValue - item.value;

            if (group === 'same') {
                result['same'].push(item.label);
            } else if (group === 'greater') {
                if (result['greater'].length === 0 || diff > result['greater'][0].diff) {
                    result['greater'] = [{label: item.label, diff: diff, value: item.value}];
                }
            } else if (group === 'less') {
                if (result['less'].length === 0 || Math.abs(diff) < Math.abs(result['less'][0].diff)) {
                    result['less'] = [{label: item.label, diff: diff, value: item.value}];
                }
            }
        });
    });

    if (result.greater.length === 0 && result.less.length === 0) {
        return `Одинаково с ${result.same.join(', ')}`
    }

    if (result.greater.length > 0 && result.less.length > 0) {
        return <React.Fragment>
            Больше {result.less[0].label} на <Tooltip
            title={`У ${result.less[0].label} отмечено ${valueFormatter(result.less[0].value)}`}><Link href="#"
                                                                                                       underline="none">{valueFormatter(Math.abs(result.less[0].diff))}</Link></Tooltip><br/>
            Меньше {result.greater[0].label} на <Tooltip
            title={`У ${result.greater[0].label} отмечено ${valueFormatter(result.greater[0].value)}`}><Link href="#"
                                                                                                             underline="none">{valueFormatter(Math.abs(result.greater[0].diff))}</Link></Tooltip>
        </React.Fragment>
    }

    if (result.greater.length > 0) {
        return <React.Fragment>
            Меньше {result.greater[0].label} на <Tooltip
            title={`У ${result.greater[0].label} отмечено ${valueFormatter(result.greater[0].value)}`}><Link href="#"
                                                                                                             underline="none">{valueFormatter(Math.abs(result.greater[0].diff))}</Link></Tooltip>
        </React.Fragment>
    }

    if (result.less.length > 0) {
        return <React.Fragment>
            Больше {result.less[0].label} на <Tooltip
            title={`У ${result.less[0].label} отмечено ${valueFormatter(result.less[0].value)}`}><Link href="#"
                                                                                                       underline="none">{valueFormatter(Math.abs(result.less[0].diff))}</Link></Tooltip>
        </React.Fragment>
    }

    return null;
};

const generateTotalTimeBox = ({row, rows}) => {
    const calculateTotalByRow = row => {
        let total = 0;

        for (const userId of Object.keys(row.byCreatedBy)) {
            const value = row.byCreatedBy[userId];
            total += value;
        }

        return total;
    };

    const total = calculateTotalByRow(row);

    const comparison = {
        greater: {},
        same: {},
        less: {}
    };

    for (const other of rows) {
        if (!other.isMaxDepth) {
            continue;
        }

        const {key, resultGroup} = other.parameters;

        if (key === row.parameters.key && resultGroup === row.parameters.resultGroup) {
            continue;
        }

        const otherTotal = calculateTotalByRow(other);

        if (otherTotal > total) {
            comparison.greater[key] = {value: otherTotal, label: other.title};
        } else if (otherTotal === total) {
            comparison.same[key] = {value: otherTotal, label: other.title};
        } else {
            comparison.less[key] = {value: otherTotal, label: other.title};
        }
    }

    return {
        index: "total-time-box",
        title: humanizeDuration(total, TIME_FORMAT_HOURS),
        subheader: "insights_dialog.boxes.total_time.sub_header",
        comparison: buildComparison(durationValueFormatter)(comparison, total),
        icon: <AccessTimeIcon/>
    };
};

const generateTotalUsersBox = (row) => {
    if (Object.keys(row.byCreatedBy).length <= 1 && row.parameters.resultGroup === RESULT_GROUP_WORKER) {
        return null;
    }

    return {
        index: "total-users-box",
        title: Object.keys(row.byCreatedBy).length,
        subheader: "insights_dialog.boxes.total_users.sub_header",
        icon: <PeopleIcon/>
    };
}

const generateAvgTimeByUserBox = (row) => {
    if (Object.keys(row.byCreatedBy).length <= 1) {
        return null;
    }

    let total = 0;

    for (const userId of Object.keys(row.byCreatedBy)) {
        const value = row.byCreatedBy[userId];
        total += value;
    }

    return {
        index: "avg-time-by-user-box",
        title: humanizeDuration(parseInt(total / Object.keys(row.byCreatedBy).length), TIME_FORMAT_HOURS),
        subheader: "insights_dialog.boxes.avg_time_by_user.sub_header",
        icon: <AccessTimeIcon/>
    };
}

const generateTotalIssuesBox = (row, rows) => {
    const calculateTotalByRow = row => {
        const uniqueIssues = [];
        let total = 0;

        for (const {details} of Object.values(row.byDate)) {
            for (const {issueKey} of details) {
                if (!uniqueIssues.includes(issueKey)) {
                    uniqueIssues.push(issueKey);
                    total += 1;
                }
            }
        }

        return total;
    };

    const total = calculateTotalByRow(row);

    if (total <= 1 && row.parameters.resultGroup !== RESULT_GROUP_WORKER) {
        return null;
    }

    const comparison = {
        greater: {},
        same: {},
        less: {}
    };

    for (const other of rows) {
        if (!other.isMaxDepth) {
            continue;
        }

        const {key, resultGroup} = other.parameters;

        if (key === row.parameters.key && resultGroup === row.parameters.resultGroup) {
            continue;
        }

        const otherTotal = calculateTotalByRow(other);

        if (otherTotal > total) {
            comparison.greater[key] = {value: otherTotal, label: other.title};
        } else if (otherTotal === total) {
            comparison.same[key] = {value: otherTotal, label: other.title};
        } else {
            comparison.less[key] = {value: otherTotal, label: other.title};
        }
    }

    return {
        index: "total-issues-box",
        title: total,
        subheader: "insights_dialog.boxes.total_issues.sub_header",
        comparison: buildComparison(numberValueFormatter)(comparison, total),
        icon: <OutlinedFlagIcon/>
    }
};

const generateAvgTimeByIssueBox = (row) => {
    const uniqueIssues = [];
    let totalIssues = 0;
    let totalTime = 0;

    for (const {details} of Object.values(row.byDate)) {
        for (const {issueKey, value} of details) {
            if (!uniqueIssues.includes(issueKey)) {
                uniqueIssues.push(issueKey);
                totalIssues += 1;
            }

            totalTime += value;
        }
    }

    if (totalIssues <= 1) {
        return null;
    }

    return {
        index: "avg-time-by-issue-box",
        title: humanizeDuration(parseInt(totalTime / totalIssues), TIME_FORMAT_HOURS),
        subheader: "insights_dialog.boxes.avg_time_by_issue.sub_header",
        icon: <OutlinedFlagIcon/>
    }
};

const generateIssuesChart = (row) => {
    const timeByIssues = {};

    for (const {details} of Object.values(row.byDate)) {
        for (const {issueKey, issueTitle, value} of details) {
            if (!timeByIssues[issueKey]) {
                timeByIssues[issueKey] = {
                    label: issueTitle,
                    value: 0
                };
            }

            timeByIssues[issueKey].value += value;
        }
    }

    if (Object.keys(timeByIssues).length <= 1) {
        return null;
    }

    return {
        type: "PIE",
        label: "insights_dialog.charts.issues.label",
        data: {
            labels: Object.values(timeByIssues).map(v => v.label),
            datasets: [
                {
                    data: Object.keys(timeByIssues).map(k => ({issueKey: k, value: timeByIssues[k].value})),
                },
            ]
        },

        options: {
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: durationValueFormatter
                    }
                }
            },
            onClick: (e, elements) => {
                const {issueKey} = elements[0].element['$context'].raw;

                window.open(yandexTrackerIssueUrl(issueKey));
            },
            onHover: (event, chartElement) => {
                event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
            }
        },
    };
}

const generateQueuesChart = (row) => {
    const timeByQueues = {};

    for (const {details} of Object.values(row.byDate)) {
        for (const {queue, queueName, value} of details) {
            if (!timeByQueues[queue]) {
                timeByQueues[queue] = {
                    label: queue.toUpperCase() === queueName.toUpperCase() ? queue : `${queue}: ${queueName}`,
                    value: 0
                };
            }

            timeByQueues[queue].value += value;
        }
    }

    if (Object.keys(timeByQueues).length <= 1) {
        return null;
    }

    return {
        type: "PIE",
        label: "insights_dialog.charts.queues.label",
        data: {
            labels: Object.values(timeByQueues).map(v => v.label),
            datasets: [
                {
                    data: Object.keys(timeByQueues).map(k => ({queueKey: k, value: timeByQueues[k].value})),
                },
            ]
        },

        options: {
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: durationValueFormatter
                    }
                }
            },
            onClick: (e, elements) => {
                const {queueKey} = elements[0].element['$context'].raw;

                window.open(yandexTrackerQueueUrl(queueKey));
            },
            onHover: (event, chartElement) => {
                event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
            }
        },
    };
}

const generateUsersChart = (row) => {
    const timeByUsers = {};

    for (const {details} of Object.values(row.byDate)) {
        for (const {createdById, createdByDisplay, value} of details) {
            if (!timeByUsers[createdById]) {
                timeByUsers[createdById] = {
                    label: createdByDisplay,
                    value: 0
                };
            }

            timeByUsers[createdById].value += value;
        }
    }

    if (Object.keys(timeByUsers).length <= 1 && row.parameters.resultGroup === RESULT_GROUP_WORKER) {
        return null;
    }

    return {
        type: "PIE",
        label: "insights_dialog.charts.users.label",
        data: {
            labels: Object.values(timeByUsers).map(v => v.label),
            datasets: [
                {
                    data: Object.values(timeByUsers),
                },
            ]
        },

        options: {
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: durationValueFormatter
                    }
                }
            }
        },
    };
}

const durationValueFormatter = value => {
    if (parseInt(value) === value) {
        return humanizeDuration(value, TIME_FORMAT_HOURS);
    }

    if (parseInt(value.parsed) > 0) {
        return humanizeDuration(value.parsed, TIME_FORMAT_HOURS);
    }

    if (parseInt(value.raw) > 0) {
        return humanizeDuration(value.raw, TIME_FORMAT_HOURS);
    }

    return humanizeDuration(0, TIME_FORMAT_HOURS);
};

function InsightsDialog() {
    const {t} = useTranslation();

    const rows = useAtomValue(resultRowsAtom);
    const row = {};

    const {isOpen, close} = useInsightsDialog();

    const [boxes, setBoxes] = useState([]);
    const [charts, setCharts] = useState([]);

    useEffect(() => {
        if (!row || Object.keys(row).length === 0) return;

        const boxes = [
            generateTotalTimeBox,
            generateTotalUsersBox,
            generateAvgTimeByUserBox,
            generateTotalIssuesBox,
            generateAvgTimeByIssueBox,
        ];

        const charts = [ // Здесь идёт приоритет генерации графиков, если значение 1 => график не попадает
            generateUsersChart,
            generateIssuesChart,
            generateQueuesChart,
        ];

        const nextBoxes = [];
        const nextCharts = [];

        for (const box of boxes) {
            const generated = box({row, rows});

            if (generated !== null) {
                nextBoxes.push(generated);

                if (nextBoxes.length === 3) {
                    break;
                }
            }
        }

        for (const chart of charts) {
            const generated = chart(row, rows);

            if (generated !== null) {
                nextCharts.push(generated);

                if (nextCharts.length === 3) {
                    break;
                }
            }
        }

        setBoxes(nextBoxes);
        setCharts(nextCharts);
    }, [row]);

    return <Dialog open={isOpen} onClose={() => close()} fullWidth maxWidth="lg">
        <DialogTitle>{t('components:insights_dialog.title')}</DialogTitle>
        {isOpen && <Container component="main" sx={{mt: 2, mb: 2}} maxWidth={false}>
            <Grid container spacing={2}>
                {boxes.map(box => {
                    return <Grid size={{xs: 12, md: 4}} key={box.index}>
                        <Card variant="outlined">
                            <CardHeader
                                avatar={
                                    <Avatar sx={{bgcolor: red[500]}}>
                                        {box.icon}
                                    </Avatar>
                                }
                                title={box.title}
                                subheader={t(`components:${box.subheader}`)}
                            />
                            {box.comparison && <CardContent>
                                <Typography sx={{color: 'text.secondary'}}>
                                    {box.comparison}
                                </Typography>
                            </CardContent>}
                        </Card>
                    </Grid>
                })}
                {charts.map(chart => {
                    return <Grid size={{xs: 12, md: 4}} key={chart.index}>
                        <Card variant="outlined">
                            <CardHeader title={t(`components:${chart.label}`)}/>
                            {chart.type === 'PIE' && <Pie
                                data={chart.data}
                                options={chart.options}
                            />}
                        </Card>
                    </Grid>
                })}
            </Grid>
        </Container>}
    </Dialog>
}

export default InsightsDialog;