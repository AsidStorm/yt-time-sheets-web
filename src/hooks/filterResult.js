import {useSetAtom} from "jotai";
import {
    dateFormatAtom,
    datesAtom,
    resultGroupsAtom,
    selectedUsersAtom,
    timeFormatAtom,
    workLogsAtom,
    hideDetailsAtom
} from "../jotai/atoms";

export function useFilterResult() {
    const setTimeFormat = useSetAtom(timeFormatAtom);
    const setDateFormat = useSetAtom(dateFormatAtom);
    const setResultGroups = useSetAtom(resultGroupsAtom);
    const setWorkLogs = useSetAtom(workLogsAtom);
    const setSelectedUsers = useSetAtom(selectedUsersAtom);
    const setDates = useSetAtom(datesAtom);
    const setHideDetails = useSetAtom(hideDetailsAtom);
    const setHighlightTime = useSetAtom(hideDetailsAtom);

    return {
        setFilteredData: ({ timeFormat, dateFormat, resultGroups, workLogs, selectedUsers, dates, hideDetails, highlightTime }) => {
            setTimeFormat(timeFormat);
            setDateFormat(dateFormat);
            setResultGroups(resultGroups);
            setWorkLogs(workLogs);
            setSelectedUsers(selectedUsers);
            setDates(dates);
            setHideDetails(hideDetails);
            setHighlightTime(highlightTime);
        }
    };
}