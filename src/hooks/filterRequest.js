import {generateMoments, pushAnalytics, sleep, sliceIntoChunks} from "../helpers";
import moment from "moment/moment";
import {
    DATE_FORMAT, DATE_FORMAT_DATE,
    DATE_FORMAT_MONTH,
    FILTER_DATE_MODE_STATUSES, FILTER_FIELD_DATE_FORMAT,
    FILTER_FIELD_DATE_FROM, FILTER_FIELD_DATE_TO,
    FILTER_FIELD_DATES_MODE, FILTER_FIELD_HIDE_DETAILS, FILTER_FIELD_HIGHLIGHT_TIME, FILTER_FIELD_ISSUE_STATUSES,
    FILTER_FIELD_ISSUE_TYPES,
    FILTER_FIELD_MOVED_TO_STATUS_MONTH, FILTER_FIELD_MOVED_TO_STATUS_YEAR, FILTER_FIELD_PROJECTS,
    FILTER_FIELD_QUERY,
    FILTER_FIELD_QUEUES, FILTER_FIELD_RESULT_GROUPS, FILTER_FIELD_SHOULD_OPTIMIZE,
    FILTER_FIELD_TIME_FORMAT,
    FILTER_FIELD_USERS, RESULT_GROUP_WORKER
} from "../constants";
import {useAtom, useSetAtom} from "jotai";
import {filterValuesAtom, selectedQueryAtom} from "../jotai/atoms";
import {useFilterResult} from "./filterResult";
import {useLoader} from "./loader";
import {useMessage} from "./message";
import {post} from "../requests";
import {useTranslation} from "react-i18next";

const minutesToTimeString = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    // Format hours and minutes separately
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const formattedMinutes = mins < 10 ? `0${mins}` : `${mins}`;

    return `${formattedHours}:${formattedMinutes}`;
}


const prepareDates = (dates, dateFormat) => {
    if (dateFormat === DATE_FORMAT_MONTH) {
        const out = [];

        let month = -1;
        let index = -1;

        for (const date of dates) { // TODO: Add Year
            if (month !== date.format("MM.YYYY")) {
                index++;
                month = date.format("MM.YYYY");
                out.push({
                    index: date.format("MM.YYYY"),
                    date,
                    grouped: true,
                    includes: []
                });
            }

            out[index].includes.push(date);
        }

        return out;
    }

    return dates.map(date => ({
        index: date.format(DATE_FORMAT),
        date,
        grouped: false,
        includes: [date]
    }));
};

const fetchData = async filter => {
    // Оптимизация может быть здесь (!) мы можем загружать данные сразу схлопывая их (!), если у нас стоит галочка "Без деталей"
    const response = await post("/api/v3/result", filter);

    return {
        workLogs: response.workLogs,
    };
};

export function useFilterRequest() {
    const {t} = useTranslation();

    const { setFilteredData } = useFilterResult();
    const {startLoading, endLoading, setLoadingValue} = useLoader();
    const {showError} = useMessage();

    const [filterValues, setFilterValues] = useAtom(filterValuesAtom);
    const setSelectedQuery = useSetAtom(selectedQueryAtom);
    const process = (data) => ({workLogs, dateFrom, dateTo}) => {
        const { issuesMovedToStatus, selectedUsers, selectedQueues, selectedProjects, selectedIssueTypes, resultGroups, timeFormat, hideDetails, shouldOptimize, dateFormat, highlightTime, useQuery } = data;

        const dates = [...generateMoments(moment(dateFrom), moment(dateTo), moment.duration({days: 1}))];

        const realDateFormat = issuesMovedToStatus ? DATE_FORMAT_MONTH : (shouldOptimize ? dateFormat : DATE_FORMAT_DATE);
        const realDates = prepareDates(dates, realDateFormat);
        const realHideDetails = shouldOptimize ? hideDetails : false;

        setFilteredData({
            timeFormat,
            resultGroups,
            workLogs,
            selectedUsers,
            dates: realDates,
            dateFormat: realDateFormat,
            hideDetails: realHideDetails,
            highlightTime: resultGroups[0] === RESULT_GROUP_WORKER && realDateFormat !== DATE_FORMAT_MONTH ? highlightTime : false,
        });

        const hlTime = resultGroups[0] === RESULT_GROUP_WORKER && realDateFormat !== DATE_FORMAT_MONTH ? minutesToTimeString(highlightTime) : false; // Подсветка времени имеет смысл ТОЛЬКО в том случае, если у нас первый элемент - сотрудник. Дальше могу быть любые группировки - но подсвечивать мы будем сотрудника.

        pushAnalytics('filterApplied', {
            usersFilter: selectedUsers.length > 0,
            queuesFilter: selectedQueues.length > 0,
            projectsFilter: selectedProjects.length > 0,
            issueTypesFilter: selectedIssueTypes.length > 0,

            dateFormat: realDateFormat,

            usersCount: selectedUsers.length,
            queuesCount: selectedQueues.length,
            projectsCount: selectedProjects.length,
            issueTypesCount: selectedIssueTypes.length,

            daysCount: dates.length,

            useHighlightTime: hlTime !== false,
            highlightTime: hlTime === false ? '00:00' : hlTime,

            resultGroup: resultGroups.join("-"),
            timeFormat: timeFormat,

            useQuery: useQuery
        });
    };

    const performRequest = ({
        timeFormat,
        query,
        rawDateFrom,
        rawDateTo,
        hideDetails,
        shouldOptimize,
        dateFormat,
        highlightTime,
        movedToStatusMonth,
        movedToStatusYear,
        issueStatuses,
        useQuery,
        selectedUsers,
        selectedQueues,
        selectedProjects,
        selectedIssueTypes,
        resultGroups,
        issuesMovedToStatus
    }) => {
        const processor = process({
            issuesMovedToStatus,
            selectedUsers,
            selectedQueues,
            selectedProjects,
            selectedIssueTypes,
            resultGroups,
            timeFormat,
            hideDetails: hideDetails !== null,
            shouldOptimize: shouldOptimize !== null,
            dateFormat,
            highlightTime: parseInt(highlightTime) || 0,
            useQuery
        });

        setSelectedQuery(useQuery ? query : "");

        if (issuesMovedToStatus) {
            if( movedToStatusMonth === null || movedToStatusYear === null ) {
                return showError(t('notifications:choose_month_and_year'));
            }

            const selectedIssueStatuses = issueStatuses === null || issueStatuses.trim() === "" ? [] : issueStatuses.split(",").map(issueStatus => String(issueStatus));

            if( selectedIssueStatuses.length === 0 ) {
                return showError(t('notifications:choose_statuses'));
            }

            startLoading();

            post("/api/v3/result", {
                userIdentities: selectedUsers,
                filter: {
                    queues: selectedQueues,
                    projects: selectedProjects,
                    issueTypes: selectedIssueTypes
                },
                filterStatuses: {
                    month: parseInt(movedToStatusMonth),
                    year: parseInt(movedToStatusYear),
                    statuses: selectedIssueStatuses
                }
            }).then(processor).catch(showError).finally(() => endLoading());

            return;
        }

        const dateFrom = moment(rawDateFrom, 'YYYY-MM-DD');
        const dateTo = moment(rawDateTo, 'YYYY-MM-DD');

        if (!dateFrom.isValid() || !dateTo.isValid()) {
            return showError(t('notifications:invalid_filter_dates'));
        }

        startLoading();

        const dates = [...generateMoments(dateFrom, dateTo, moment.duration({days: 1}))];
        const chunks = sliceIntoChunks(dates, selectedUsers.length !== 0 && selectedUsers.length < 10 ? 20 : 10);

        const fetchChunks = async chunks => {
            const out = [];

            const total = chunks.length;
            let loaded = 0;

            if (chunks.length !== 1) {
                setLoadingValue(0);
            }

            const filter = {
                userIdentities: selectedUsers,
            };

            if( useQuery ) {
                filter.query = query;
            } else {
                filter.filter = {
                    queues: selectedQueues,
                    projects: selectedProjects,
                    issueTypes: selectedIssueTypes
                };
            }

            const loadChunks = async chunks => {
                const failedChunks = [];

                for (const chunk of chunks) {
                    try {
                        filter.dateFrom = chunk[0].format();
                        filter.dateTo = chunk[chunk.length - 1].format();

                        const {workLogs} = await fetchData(filter);
                        loaded++;

                        if (chunks.length !== 1) {
                            setLoadingValue(parseInt(100 / (total / loaded)));
                        }

                        out.push(...workLogs);
                        await sleep(250);
                    } catch (e) {
                        failedChunks.push(chunk);
                    }
                }

                return {failedChunks};
            };

            const {failedChunks} = await loadChunks(chunks);

            if (failedChunks.length > 0) {
                await loadChunks(failedChunks);
            }

            return {
                dateFrom,
                dateTo,
                workLogs: out
            };
        };

        return fetchChunks(chunks).then(processor).catch(showError).finally(() => endLoading());
    };

    const doRequest = formData => {
        const timeFormat = formData.get(FILTER_FIELD_TIME_FORMAT);
        const users = formData.get(FILTER_FIELD_USERS);
        const query = formData.get(FILTER_FIELD_QUERY);
        const queues = formData.get(FILTER_FIELD_QUEUES);
        const issueTypes = formData.get(FILTER_FIELD_ISSUE_TYPES);
        const projects = formData.get(FILTER_FIELD_PROJECTS);
        const rawResultGroups = formData.get(FILTER_FIELD_RESULT_GROUPS);
        const datesMode = formData.get(FILTER_FIELD_DATES_MODE);
        const rawDateFrom = formData.get(FILTER_FIELD_DATE_FROM);
        const rawDateTo = formData.get(FILTER_FIELD_DATE_TO);
        const hideDetails = formData.get(FILTER_FIELD_HIDE_DETAILS);
        const shouldOptimize = formData.get(FILTER_FIELD_SHOULD_OPTIMIZE);
        const dateFormat = formData.get(FILTER_FIELD_DATE_FORMAT);
        const highlightTime = formData.get(FILTER_FIELD_HIGHLIGHT_TIME);

        const useQuery = query !== null;

        const selectedUsers = users === null || users.trim() === "" ? [] : users.split(",").map(user => String(user));
        const selectedQueues = queues === null || queues.trim() === "" ? [] : queues.split(",").map(queue => String(queue));
        const selectedProjects = projects === null || projects.trim() === "" ? [] : projects.split(",").map(project => String(project));
        const selectedIssueTypes = issueTypes === null || issueTypes.trim() === "" ? [] : issueTypes.split(",").map(issueType => parseInt(issueType));
        const resultGroups = rawResultGroups === null || rawResultGroups.trim() === "" ? [] : rawResultGroups.split(",");

        const issuesMovedToStatus = datesMode && datesMode === FILTER_DATE_MODE_STATUSES && !useQuery;

        const movedToStatusMonth = formData.get(FILTER_FIELD_MOVED_TO_STATUS_MONTH);
        const movedToStatusYear = formData.get(FILTER_FIELD_MOVED_TO_STATUS_YEAR);
        const issueStatuses = formData.get(FILTER_FIELD_ISSUE_STATUSES);

        const data = {
            timeFormat,
            users,
            query,
            queues,
            issueTypes,
            projects,
            rawResultGroups,
            datesMode,
            rawDateFrom,
            rawDateTo,
            hideDetails,
            shouldOptimize,
            dateFormat,
            highlightTime,
            movedToStatusMonth,
            movedToStatusYear,
            issueStatuses,
            useQuery,
            selectedUsers,
            selectedQueues,
            selectedProjects,
            selectedIssueTypes,
            resultGroups,
            issuesMovedToStatus
        };

        setFilterValues(data);

        return performRequest(data);
    };

    const reload = () => {
        return performRequest(filterValues);
    };

    return {
        doRequest,
        reload
    };
}