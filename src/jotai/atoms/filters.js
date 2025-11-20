import {atom} from "jotai"
import {DATE_FORMAT_DATE} from "../../constants";
import moment from "moment/moment";

export const selectedQueuesAtom = atom([]);
export const selectedIssueTypesAtom = atom([]);
export const selectedProjectsAtom = atom([]);
export const selectedDateFormat = atom(DATE_FORMAT_DATE);
export const selectedShouldOptimize = atom(false);
export const selectedIssueStatusesAtom = atom([]);
export const selectedIssuesMovedToStatus = atom(false);
export const selectedMonthAtom = atom(moment());
export const selectedDateToAtom = atom(moment());
export const selectedDateFromAtom = atom(moment());
export const selectedHideDetailsAtom = atom(false);

export const selectedQueryAtom = atom("");

export const filterValuesAtom = atom({});