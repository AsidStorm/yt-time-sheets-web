import React, {useEffect, useState} from "react";
import Grid from "@mui/material/Grid2";
import {DATE_FORMAT, DATE_FORMAT_DATE, TIME_FORMAT_HOURS, TIME_FORMAT_MINUTES} from "../constants";
import {pushAnalytics, yandexTrackerIssueUrl, yandexTrackerProjectUrl, yandexTrackerQueueUrl} from "../helpers";
import moment from "moment";

import {Chart as ChartJS, registerables} from 'chart.js';

import {Pie, Bar} from 'react-chartjs-2';
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {useHumanizeDuration} from "../hooks";
import {useTranslation} from "react-i18next";
import {Tab, Alert, Box, Dialog} from "@mui/material";
import {useAtomValue} from "jotai";
import {dateFormatAtom, datesAtom} from "../jotai/atoms";

ChartJS.register(...registerables);

const USERS_CATEGORY = 'USERS';
const QUEUES_CATEGORY = 'QUEUES';
const ISSUES_CATEGORY = 'ISSUES';
const ISSUE_TYPES_CATEGORY = 'ISSUE_TYPES';
const EPICS_CATEGORY = 'EPICS';
const PROJECTS_CATEGORY = 'PROJECTS';

const BAR_TYPE_PIE = "PIE";
const BAR_TYPE_BAR_STACKED = "BAR_STACKED";

function ChartsDialog({state, handleClose, workLogs}) {
    const {t} = useTranslation();

    const dateFormat = useAtomValue(dateFormatAtom);
    const dates = useAtomValue(datesAtom);

    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [categories, setCategories] = useState([]);

    const humanizeDuration = useHumanizeDuration((timeFormat) => {
        if ([TIME_FORMAT_HOURS, TIME_FORMAT_MINUTES].includes(timeFormat)) {
            return timeFormat;
        }

        return TIME_FORMAT_HOURS;
    });

    const categoryValue = category => category.value;
    const subCategoryValue = (category, chart) => `${category.value}-${chart.value}`;

    const handleSetCategory = (event, newValue) => {
        setCategory(newValue);
        const category = categories.find(category => category.value === newValue);
        setSubCategory(subCategoryValue(category, category.charts[0]));

        pushAnalytics('setupChartsCategory', {
            category: newValue
        });
    };

    const handleSetSubCategory = (event, newValue) => {
        setSubCategory(newValue);

        pushAnalytics('setupChartsSubCategory', {
            category: category,
            subCategory: newValue
        });
    };

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

    const makePieChart = (value, data, clickable) => {
        const options = clickable ? {
            onClick: (e, elements) => {
                const {link} = elements[0].element['$context'].raw;

                if (!!link) {
                    window.open(link);
                }
            },
            onHover: (event, chartElements) => {
                const haveLink = chartElements && chartElements[0] && chartElements[0].element['$context'].raw && !!chartElements[0].element['$context'].raw.link;

                event.native.target.style.cursor = haveLink ? 'pointer' : 'default';
            }
        } : {};

        return {
            type: BAR_TYPE_PIE,
            value,

            data: {
                labels: Object.values(data).map(({label}) => label),
                datasets: [
                    {
                        data: Object.values(data),
                    },
                ]
            },

            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "right",
                    },
                    tooltip: {
                        callbacks: {
                            label: durationValueFormatter
                        }
                    }
                },
                ...options
            }
        };
    }

    const makeStackedBarChart = (value, data) => {
        return {
            type: BAR_TYPE_BAR_STACKED,
            value,

            data: {
                labels: dates.map(({title}) => title),
                datasets: Object.keys(data).map(key => {
                    return {
                        label: data[key].label,
                        data: Object.values(data[key].data),
                        stack: "stack-o"
                    }
                })
            },

            options: {
                maintainAspectRatio: false,

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

    const prepareCharts = () => {
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


        const workLogEpic = ({epicKey, epicDisplay}) => {
            if (epicKey === "") {
                return {epicKey: "NO_EPIC", epicTitle: "Не указан"};
            }

            return {epicKey, epicTitle: epicDisplay};
        };

        const workLogProject = ({projectId, projectName}) => {
            if (projectId === "" || projectId === "0") {
                return {projectId: "-1", projectName: "Не указан"};
            }

            return {projectId, projectName};
        };

        for (const log of workLogs) {
            const date = dateFormat === DATE_FORMAT_DATE ? moment(log.createdAt).format(DATE_FORMAT) : moment(log.createdAt).format("MM.YYYY");

            const {projectId, projectName} = workLogProject(log);
            const {epicKey, epicTitle} = workLogEpic(log);

            if (!users[log.createdById]) {
                users[log.createdById] = log.createByDisplay;
            }

            if (!pieChartByUsers[log.createdById]) {
                pieChartByUsers[log.createdById] = {id: log.createdById, label: log.createByDisplay, value: 0}
            }

            if (!pieChartByProject[projectId]) {
                pieChartByProject[projectId] = {
                    id: projectId,
                    label: projectName,
                    value: 0,
                    link: projectId === "-1" ? null : yandexTrackerProjectUrl(projectId)
                };
            }

            if (!pieChartByIssueType[log.typeId]) {
                pieChartByIssueType[log.typeId] = {id: log.typeId, label: log.typeDisplay, value: 0};
            }

            if (!barChartByUsersAndDate[log.createdById]) {
                barChartByUsersAndDate[log.createdById] = {
                    label: log.createByDisplay,
                    data: {}
                };

                for (const originalDate of dates) {
                    barChartByUsersAndDate[log.createdById].data[originalDate.index] = 0;
                }
            }

            if (!barChartByProjectAndDate[projectId]) {
                barChartByProjectAndDate[projectId] = {
                    label: projectName,
                    data: {}
                };

                for (const originalDate of dates) {
                    barChartByProjectAndDate[projectId].data[originalDate.index] = 0;
                }
            }

            if (!barChartByQueueAndDate[log.queue]) {
                barChartByQueueAndDate[log.queue] = {
                    label: log.queue,
                    data: {}
                };

                for (const originalDate of dates) {
                    barChartByQueueAndDate[log.queue].data[originalDate.index] = 0;
                }
            }

            if (!barChartByIssueAndDate[log.issueKey]) {
                barChartByIssueAndDate[log.issueKey] = {
                    label: log.issueKey + ": " + log.issueDisplay,
                    data: {}
                };

                for (const originalDate of dates) {
                    barChartByIssueAndDate[log.issueKey].data[originalDate.index] = 0;
                }
            }

            if (!barChartByEpicAndDate[epicKey]) {
                barChartByEpicAndDate[epicKey] = {
                    label: epicKey === "NO_EPIC" ? "Нет" : (epicKey + ": " + epicTitle),
                    data: {}
                };

                for (const originalDate of dates) {
                    barChartByEpicAndDate[epicKey].data[originalDate.index] = 0;
                }
            }

            if (!barChartByIssueTypeAndDate[log.typeId]) {
                barChartByIssueTypeAndDate[log.typeId] = {
                    label: log.typeDisplay,
                    data: {}
                };

                for (const originalDate of dates) {
                    barChartByIssueTypeAndDate[log.typeId].data[originalDate.index] = 0;
                }
            }

            if (!pieChartByEpic[epicKey]) {
                pieChartByEpic[epicKey] = {
                    id: epicKey,
                    label: epicKey === "NO_EPIC" ? "Не указано" : (epicKey + ": " + epicTitle),
                    link: epicKey === "NO_EPIC" ? null : yandexTrackerIssueUrl(epicKey),
                    value: 0
                }
            }

            if (!pieChartByIssues[log.issueKey]) {
                pieChartByIssues[log.issueKey] = {
                    id: log.issueKey,
                    label: log.issueKey + ": " + log.issueDisplay,
                    link: yandexTrackerIssueUrl(log.issueKey),
                    value: 0
                }
            }

            if (!pieChartByDate[date]) {
                pieChartByDate[date] = {id: date, label: date, value: 0}
            }

            if (!pieChartByQueue[log.queue]) {
                pieChartByQueue[log.queue] = {
                    id: log.queue,
                    label: log.queue,
                    value: 0,
                    link: yandexTrackerQueueUrl(log.queue)
                }
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

        const nextCategories = {
            [USERS_CATEGORY]: {
                value: USERS_CATEGORY,
                charts: []
            },
            [QUEUES_CATEGORY]: {
                value: QUEUES_CATEGORY,
                charts: []
            },
            [ISSUES_CATEGORY]: {
                value: ISSUES_CATEGORY,
                charts: []
            },
            [ISSUE_TYPES_CATEGORY]: {
                value: ISSUE_TYPES_CATEGORY,
                charts: []
            },
            [EPICS_CATEGORY]: {
                value: EPICS_CATEGORY,
                charts: []
            },
            [PROJECTS_CATEGORY]: {
                value: PROJECTS_CATEGORY,
                charts: []
            }
        };

        if (Object.keys(pieChartByUsers).length > 1) {
            nextCategories[USERS_CATEGORY].charts.push(makePieChart('BASIC_PIE', pieChartByUsers));
        }

        if (Object.keys(pieChartByIssues).length > 1) {
            nextCategories[ISSUES_CATEGORY].charts.push(makePieChart('BASIC_PIE', pieChartByIssues, true));
        }

        if (Object.keys(pieChartByQueue).length > 1) {
            nextCategories[QUEUES_CATEGORY].charts.push(makePieChart('BASIC_PIE', pieChartByQueue, true));
        }

        if (Object.keys(pieChartByIssueType).length > 1) {
            nextCategories[ISSUE_TYPES_CATEGORY].charts.push(makePieChart('BASIC_PIE', pieChartByIssueType));
        }

        if (Object.keys(pieChartByEpic).length > 1) {
            nextCategories[EPICS_CATEGORY].charts.push(makePieChart('BASIC_PIE', pieChartByEpic, true));
        }

        if (Object.keys(pieChartByProject).length > 1) {
            nextCategories[PROJECTS_CATEGORY].charts.push(makePieChart('BASIC_PIE', pieChartByProject, true));
        }

        if (Object.keys(barChartByUsersAndDate).length > 1 || dates.length > 1) {
            nextCategories[USERS_CATEGORY].charts.push(makeStackedBarChart('BASIC_BAR_STACKED', barChartByUsersAndDate));
        }

        if (Object.keys(barChartByQueueAndDate).length > 1 || dates.length > 1) {
            nextCategories[QUEUES_CATEGORY].charts.push(makeStackedBarChart('BASIC_BAR_STACKED', barChartByQueueAndDate));
        }

        if (Object.keys(barChartByIssueAndDate).length > 1 || dates.length > 1) {
            nextCategories[ISSUES_CATEGORY].charts.push(makeStackedBarChart('BASIC_BAR_STACKED', barChartByIssueAndDate));
        }

        if (Object.keys(barChartByProjectAndDate).length > 1 || dates.length > 1) {
            nextCategories[PROJECTS_CATEGORY].charts.push(makeStackedBarChart('BASIC_BAR_STACKED', barChartByProjectAndDate));
        }

        if (Object.keys(barChartByIssueTypeAndDate).length > 1 || dates.length > 1) {
            nextCategories[ISSUE_TYPES_CATEGORY].charts.push(makeStackedBarChart('BASIC_BAR_STACKED', barChartByIssueTypeAndDate));
        }

        if (Object.keys(barChartByEpicAndDate).length > 1 || dates.length > 1) {
            nextCategories[EPICS_CATEGORY].charts.push(makeStackedBarChart('BASIC_BAR_STACKED', barChartByEpicAndDate));
        }

        const arrayCategories = Object.values(nextCategories).filter(category => category.charts.length > 0);

        if (arrayCategories.length > 0) {
            setCategory(categoryValue(arrayCategories[0]));
            setSubCategory(subCategoryValue(arrayCategories[0], arrayCategories[0].charts[0]));
        }

        setCategories(arrayCategories);
    };

    useEffect(() => {
        prepareCharts();
    }, [workLogs]);

    function Chart({chart}) {
        if (chart.type === "PIE") {
            return <Pie
                data={chart.data}
                options={chart.options}
            />
        }

        if (chart.type === "BAR_STACKED") {
            return <Bar
                data={chart.data}
                options={chart.options}
            />
        }

        return <Alert>Неизвестный тип графика [{chart.type}]</Alert>
    }

    function Charts({category}) {
        const {charts} = category;

        return <TabContext value={subCategory}>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <TabList
                    onChange={handleSetSubCategory}
                >
                    {charts.map(chart => {
                        const key = `categories_${category.value}_sub_category_${chart.type}`;
                        const value = `${category.value}-${chart.value}`;
                        const label = t(`charts:categories.${category.value}.sub_categories.${chart.value}.label`);

                        return <Tab key={key} value={value} label={label}/>
                    })}
                </TabList>
            </Box>
            {charts.map(chart => {
                return <TabPanel key={`categories_${category.value}_subcategory_${chart.type}_panel`}
                                 value={category.value + '-' + chart.value} sx={{height: '500px'}}>
                    <Chart chart={chart}/>
                </TabPanel>
            })}
        </TabContext>
    }

    return <Dialog open={state} onClose={() => handleClose()} fullWidth maxWidth="lg">
        <Grid container spacing={2}>
            <TabContext value={category}>
                <Box sx={{display: 'flex', width: '100%'}}>
                    <TabList
                        orientation="vertical"
                        variant="scrollable"
                        onChange={handleSetCategory}
                        sx={{
                            borderRight: 1,
                            borderColor: 'divider',
                            minWidth: 180
                        }}
                    >
                        {categories.map(category => (
                            <Tab
                                key={`categories_${category.value}`}
                                value={category.value}
                                label={t(`charts:categories.${category.value}.label`)}
                                sx={{alignItems: 'flex-end'}}
                            />
                        ))}
                    </TabList>

                    <Box sx={{flexGrow: 1, width: 'calc(100% - 180px)'}}>
                        {categories.map(category => (
                            <TabPanel
                                key={`categories_tab_${category.value}`}
                                value={category.value}
                                sx={{
                                    width: '100%',
                                    p: 0,
                                    height: '100%'
                                }}
                            >
                                <Grid container spacing={2} sx={{width: '100%'}}>
                                    <Grid item xs={12} sx={{width: '100%'}}>
                                        <Charts category={category}/>
                                    </Grid>
                                </Grid>
                            </TabPanel>
                        ))}
                    </Box>
                </Box>
            </TabContext>
        </Grid>
    </Dialog>
}

export default ChartsDialog;