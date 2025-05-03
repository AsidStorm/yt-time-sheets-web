import React, {useEffect, useState} from "react";
import {Dialog, Grid2 as Grid, Container, Avatar, Tooltip, Link} from "@mui/material";
import {
    DATE_FORMAT,
    DATE_FORMAT_DATE,
    RESULT_GROUP_EPIC,
    RESULT_GROUP_ISSUE, RESULT_GROUP_ISSUE_TYPE, RESULT_GROUP_PROJECT, RESULT_GROUP_QUEUE,
    RESULT_GROUP_WORKER,
    TIME_FORMAT_HOURS
} from "../constants";
import {Card, CardHeader} from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import {red} from "@mui/material/colors";
import {yandexTrackerIssueUrl, yandexTrackerQueueUrl} from "../helpers";
import {Chart as ChartJS, registerables} from 'chart.js';
import {Bar, Pie} from 'react-chartjs-2';
import {useTranslation} from "react-i18next";
import {useDateFormatter, useHumanizeDuration, useInsightsDialog} from "../hooks";
import {useAtomValue} from "jotai";
import {dateFormatAtom, datesAtom, resultRowsAtom} from "../jotai/atoms";
import moment from "moment/moment";

ChartJS.register(...registerables);

const BAR_TYPE_PIE = "PIE";
const BAR_TYPE_BAR_STACKED = "BAR_STACKED";

const numberValueFormatter = value => value;

const buildComparison = (valueFormatter) => (data, userValue) => {
    const result = {
        greater: [],
        same: [],
        less: []
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

const generateTotalTimeBox = ({row, rows, durationValueFormatter, humanizeDuration}) => {
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

const generateTotalUsersBox = ({row}) => {
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

const generateAvgTimeByUserBox = ({row, humanizeDuration}) => {
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

const generateTotalIssuesBox = ({row, rows}) => {
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

    if (total <= 1 && row.parameters.resultGroup === RESULT_GROUP_ISSUE) {
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

const generateAvgTimeByIssueBox = ({row, humanizeDuration}) => {
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

const generateIssuesChart = ({row, durationValueFormatter}) => {
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

const generateQueuesChart = ({row, durationValueFormatter}) => {
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

const generateUsersChart = ({row, durationValueFormatter}) => {
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

const generateBarChartByUserAndDate = ({row, dates, formatDate, durationValueFormatter, dateFormat}) => {
    const data = {};

    for( const byDate of Object.values(row.byDate) ) {
        for( const log of byDate.details ) {
            const key = dateFormat === DATE_FORMAT_DATE ? moment(log.createdAt).format(DATE_FORMAT) : moment(log.createdAt).format("MM.YYYY");

            if (!data[log.createdById]) {
                data[log.createdById] = {
                    label: log.createdByDisplay,
                    data: {}
                };

                for (const originalDate of dates) {
                    data[log.createdById].data[originalDate.index] = 0;
                }
            }

            data[log.createdById].data[key] += log.value;
        }
    }

    return {
        type: BAR_TYPE_BAR_STACKED,
        index: 'bar-chart-by-user-and-date',
        label: 'insights_dialog.charts.user_and_date.label',

        data: {
            labels: dates.map(date => formatDate(date)),
            datasets: Object.keys(data).map(key => {
                return {
                    label: data[key].label,
                    data: Object.values(data[key].data),
                    stack: "stack-o"
                }
            })
        },

        options: {
            maintainAspectRatio: true,

            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,

                    ticks: {
                        callback: function (value) {
                            return durationValueFormatter(value);
                        }
                    }
                }
            },

            plugins: {
                legend: {
                    position: "right",
                },
                tooltip: {
                    callbacks: {
                        label: value => {
                            return value.dataset.label + ": " + durationValueFormatter(value);
                        }
                    }
                }
            }
        }
    };
}

const generateBarChartByIssueAndDate = ({row, dates, formatDate, durationValueFormatter, dateFormat}) => {
    const data = {};

    for( const byDate of Object.values(row.byDate) ) {
        for( const log of byDate.details ) {
            const key = dateFormat === DATE_FORMAT_DATE ? moment(log.createdAt).format(DATE_FORMAT) : moment(log.createdAt).format("MM.YYYY");

            if (!data[log.issueKey]) {
                data[log.issueKey] = {
                    label: log.issueTitle,
                    data: {}
                };

                for (const originalDate of dates) {
                    data[log.issueKey].data[originalDate.index] = 0;
                }
            }

            data[log.issueKey].data[key] += log.value;
        }
    }

    return {
        type: BAR_TYPE_BAR_STACKED,
        index: 'bar-chart-by-issue-and-date',
        label: 'insights_dialog.charts.issue_and_date.label',

        data: {
            labels: dates.map(date => formatDate(date)),
            datasets: Object.keys(data).map(key => {
                return {
                    label: data[key].label,
                    data: Object.values(data[key].data),
                    stack: "stack-o"
                }
            })
        },

        options: {
            maintainAspectRatio: true,

            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,

                    ticks: {
                        callback: function (value) {
                            return durationValueFormatter(value);
                        }
                    }
                }
            },

            plugins: {
                legend: {
                    position: "right",
                },
                tooltip: {
                    callbacks: {
                        label: value => {
                            return value.dataset.label + ": " + durationValueFormatter(value);
                        }
                    }
                }
            }
        }
    };
}

function InsightsDialog() {
    const {t} = useTranslation();

    const rows = useAtomValue(resultRowsAtom);
    const dates = useAtomValue(datesAtom);
    const dateFormat = useAtomValue(dateFormatAtom);

    const {isOpen, close, row} = useInsightsDialog();
    const humanizeDuration = useHumanizeDuration();
    const {formatDate} = useDateFormatter();

    const [boxes, setBoxes] = useState([]);
    const [charts, setCharts] = useState([]);

    useEffect(() => {
        if (!row || Object.keys(row).length === 0) return;

        const durationValueFormatter = value => {
            if (parseInt(value) === value) {
                return humanizeDuration(value);
            }

            if (parseInt(value.parsed) > 0) {
                return humanizeDuration(value.parsed);
            }

            if (parseInt(value.raw) > 0) {
                return humanizeDuration(value.raw);
            }

            return humanizeDuration(0);
        };

        const boxes = [
            /*generateTotalTimeBox,
            generateTotalUsersBox,
            generateTotalIssuesBox,
            generateAvgTimeByUserBox,
            generateAvgTimeByIssueBox,*/
        ];

        const charts = {
            [RESULT_GROUP_ISSUE]: [generateUsersChart, generateBarChartByUserAndDate],
            [RESULT_GROUP_WORKER]: [generateIssuesChart, generateBarChartByIssueAndDate],
            [RESULT_GROUP_QUEUE]: [generateUsersChart, generateIssuesChart],
            [RESULT_GROUP_ISSUE_TYPE]: [generateUsersChart, generateIssuesChart, generateQueuesChart],
            [RESULT_GROUP_EPIC]: [generateUsersChart, generateIssuesChart, generateQueuesChart],
            [RESULT_GROUP_PROJECT]: [generateUsersChart, generateIssuesChart, generateQueuesChart],
        };

        const nextBoxes = [];
        const nextCharts = [];

        for (const box of boxes) {
            const generated = box({row, rows, durationValueFormatter, humanizeDuration});

            if (generated !== null) {
                nextBoxes.push(generated);

                if (nextBoxes.length === 3) {
                    break;
                }
            }
        }

        for (const chart of charts[row.parameters.resultGroup]) {
            const generated = chart({row, rows, durationValueFormatter, humanizeDuration, formatDate, dates, dateFormat});

            if (generated !== null) {
                nextCharts.push(generated);

                if (nextCharts.length === 3) {
                    break;
                }
            }
        }

        setBoxes(nextBoxes);
        setCharts(nextCharts);
    }, [row, rows]);

    return <Dialog open={isOpen} onClose={() => close()} fullWidth maxWidth="lg">
        {isOpen && row && <Container component="main" sx={{mt: 2, mb: 2}} maxWidth={false}>
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
                            {/*box.comparison && <CardContent>
                                <Typography sx={{color: 'text.secondary'}}>
                                    {box.comparison}
                                </Typography>
                            </CardContent>*/}
                        </Card>
                    </Grid>
                })}
                {charts.map(chart => {
                    return <Grid size={{xs: 12, md: (chart.type === BAR_TYPE_BAR_STACKED ? 8 : 4)}} key={chart.index}>
                        <Card variant="outlined" sx={{height: '500px'}}>
                            <CardHeader title={t(`components:${chart.label}`)}/>
                            {chart.type === BAR_TYPE_PIE && <Pie
                                data={chart.data}
                                options={chart.options}
                            />}
                            {chart.type === BAR_TYPE_BAR_STACKED && <Bar
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