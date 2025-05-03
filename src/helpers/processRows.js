import {
    DATE_FORMAT,
    DATE_FORMAT_DATE,
    RESULT_GROUP_EPIC,
    RESULT_GROUP_ISSUE_TYPE, RESULT_GROUP_NONE,
    RESULT_GROUP_PROJECT,
    RESULT_GROUP_QUEUE,
    RESULT_GROUP_WORKER, WEEKEND_WEEK_DAYS
} from "../constants";
import moment from "moment/moment";
import {extractRawMinutesFromDuration} from "./duration";

const flatten = (groups, depth) => {
    const flat = [];

    const items = Object.values( groups );

    let iterator = 0;

    items.forEach(item => {
        const {sub, ...rest} = item;

        rest.realIndex = iterator;
        iterator++;

        flat.push(rest);

        if (Object.keys(sub).length > 0) {
            flat.push(...flatten(sub, depth+1));
        }
    });

    return flat;
};

const groupParametersCaller = (queuesMap) => (workLog, resultGroup) => {
    switch( resultGroup ) {
        case RESULT_GROUP_QUEUE:
            const queue = queuesMap[workLog.queue];

            return { key: workLog.queue, title: queue ? queue.label : workLog.queue };
        case RESULT_GROUP_PROJECT:
            return { key: workLog.projectId, title: workLog.projectId === "" ? "Проект не указан" : workLog.projectName };
        case RESULT_GROUP_EPIC:
            return { key: workLog.epicKey, title: workLog.epicKey === "" ? "Эпик не указан" : `${workLog.epicKey}: ${workLog.epicDisplay}` };
        case RESULT_GROUP_WORKER:
            return { key: workLog.createdById, title: workLog.createByDisplay };
        case RESULT_GROUP_ISSUE_TYPE:
            return { key: workLog.typeId, title: `${workLog.typeDisplay}` };
    }

    return { key: workLog.issueKey, title: `${workLog.issueKey}: ${workLog.issueDisplay}` };
};

export const processRows = (workLogs, queuesMap, dateFormat, resultGroups, highlightTime, dates) => {
    console.log( dates );

    const totalRow = {
        title: "Итого",
        byDate: {},
        byCreatedBy: {},
        isSummary: true,
        value: 0
    };

    // Структура у нас следующая
    // Внешняя группировка
    // Внутренняя группировка
    // Если группировок нет - показываем список задач

    // Сделаем НОВУЮ. Иерархическую структуру.
    // В конце всего - могу лежать задачи (по умолчанию, например, скрытые)

    const groups = {};
    const groupParameters = groupParametersCaller(queuesMap);

    for (const workLog of workLogs) {
        const queue = queuesMap[workLog.queue];
        const dateKey = dateFormat === DATE_FORMAT_DATE ? moment(workLog.createdAt).format(DATE_FORMAT) : moment(workLog.createdAt).format("MM.YYYY");

        if (!totalRow.byDate[dateKey]) {
            totalRow.byDate[dateKey] = {
                value: 0,
                byCreatedBy: {},
                details: []
            };
        }

        if( !totalRow.byCreatedBy[workLog.createdById] ) {
            totalRow.byCreatedBy[workLog.createdById] = 0;
        }

        if( !totalRow.byDate[dateKey].byCreatedBy[workLog.createdById] ) {
            totalRow.byDate[dateKey].byCreatedBy[workLog.createdById] = 0;
        }

        totalRow.byDate[dateKey].value += workLog.duration;
        totalRow.value += workLog.duration;

        totalRow.byCreatedBy[workLog.createdById] += workLog.duration;
        totalRow.byDate[dateKey].byCreatedBy[workLog.createdById] += workLog.duration;

        let storage = groups;
        let depth = 0;

        for (const resultGroup of resultGroups) {
            if( resultGroup === RESULT_GROUP_NONE ) {
                break;
            }

            const {key, title} = groupParameters(workLog, resultGroup);

            const isMaxDepth = depth === resultGroups.length - 2;

            if( !storage[key] ) {
                storage[key] = { // ROW
                    parameters: {
                        resultGroup,
                        key
                    },
                    extra: {
                        issueKey: workLog.issueKey,
                        issueDisplay: `${workLog.issueKey}: ${workLog.issueDisplay}`,
                        issueTitle: workLog.issueDisplay,

                        issueTypeId: workLog.typeId,
                        issueTypeKey: workLog.typeKey,
                        issueTypeDisplay: workLog.typeDisplay,

                        projectId: workLog.projectId,
                        projectName: workLog.projectName,

                        queue: workLog.queue,
                        queueName: queue ? queue.title : "!" + workLog.queue + "!",

                        createdById: workLog.createdById,
                        createdByDisplay: workLog.createByDisplay,

                        epicKey: workLog.epicKey,
                        epicDisplay: workLog.epicDisplay,
                    },
                    title: title,
                    byDate: {},
                    value: 0,
                    byCreatedBy: {},
                    depth,
                    isMaxDepth,
                    sub: {}
                };
            }

            if( !storage[key].byDate[dateKey] ) {
                storage[key].byDate[dateKey] = {
                    value: 0,
                    byCreatedBy: {},
                    details: []
                };
            }

            if( !storage[key].byDate[dateKey].byCreatedBy[workLog.createdById] ) {
                storage[key].byDate[dateKey].byCreatedBy[workLog.createdById] = 0;
            }

            if( !storage[key].byCreatedBy[workLog.createdById] ) {
                storage[key].byCreatedBy[workLog.createdById] = 0;
            }

            storage[key].value += workLog.duration;
            storage[key].byDate[dateKey].value += workLog.duration;

            storage[key].byCreatedBy[workLog.createdById] += workLog.duration;
            storage[key].byDate[dateKey].byCreatedBy[workLog.createdById] += workLog.duration;

            if( isMaxDepth ) {
                // Если мы в самом конце списка, самое время подготовить details
                storage[key].byDate[dateKey].details.push({
                    workLogId: workLog.workLogId,

                    issueKey: workLog.issueKey,
                    issueTitle: `${workLog.issueKey}: ${workLog.issueDisplay}`,

                    createdByDisplay: workLog.createByDisplay,
                    createdById: workLog.createdById,

                    description: workLog.comment,
                    value: workLog.duration,

                    queue: workLog.queue,
                    queueName: queue ? queue.title : workLog.queue,

                    exactDate: moment(workLog.createdAt).format(DATE_FORMAT), // TODO: REPLACE ME

                    isDetails: true
                });
            }

            storage = storage[key].sub;
            depth++;
        }
    }

    const badTimeDuration = highlightTime !== false ? highlightTime.minute() + (highlightTime.hour() * 60) : 0;

    const out = flatten(groups, 0);
    out.push(totalRow);

    return out.map( row => {
        // Добавляем всякое разное на основе полного состояния строки
        for( const date of dates ) {
            if( !row.byDate[date.index] ) {
                row.byDate[date.index] = {
                    value: 0,
                    byCreatedBy: {},
                    details: []
                };
            }
        }

        if( badTimeDuration > 0 && row.parameters && row.parameters.resultGroup === RESULT_GROUP_WORKER ) {
            for( const dateIndex of Object.keys(row.byDate) ) {
                const duration = row.byDate[dateIndex].value;

                const date = dates.find( date => date.index === dateIndex );

                row.byDate[dateIndex].isUnexpectedDuration = date && !date.grouped && !WEEKEND_WEEK_DAYS.includes(date.includes[0].isoWeekday()) && extractRawMinutesFromDuration(duration) < badTimeDuration;
            }
        }

        return row;
    });
};