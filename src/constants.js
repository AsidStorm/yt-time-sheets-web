export const TIME_FORMAT_HOURS = "HOURS";
export const TIME_FORMAT_MINUTES = "MINUTES";
export const TIME_FORMAT_MONEY = "MONEY";

export const TIME_FORMATS = [
    TIME_FORMAT_HOURS,
    TIME_FORMAT_MINUTES
    /*TIME_FORMAT_MONEY*/
];

export const DATE_FORMAT_DATE = "DATE";
export const DATE_FORMAT_MONTH = "MONTH";

export const DATE_FORMATS = [
    DATE_FORMAT_DATE,
    DATE_FORMAT_MONTH
];

export const RESULT_GROUP_NONE = "NONE";
export const RESULT_GROUP_WORKER = "WORKER";
export const RESULT_GROUP_QUEUE = "QUEUE"; // Группировка по очереди
export const RESULT_GROUP_PROJECT = "PROJECT";
export const RESULT_GROUP_EPIC = "EPIC"; // Группировка по эпику
export const RESULT_GROUP_ISSUE = "ISSUE"; // Группировка по задаче
export const RESULT_GROUP_ISSUE_TYPE = "ISSUE_TYPE"; // Группировка по типу задачи

export const DEPTH_COLORS = [
    'rgb(229, 229, 255)',  // rgba(0, 0, 255, 0.12) blended with white
    'rgb(209, 209, 255)',  // rgba(0, 0, 255, 0.18) blended with white
    'rgb(194, 194, 255)',  // rgba(0, 0, 255, 0.24) blended with white
    'rgb(178, 178, 255)',  // rgba(0, 0, 255, 0.30) blended with white
    'rgb(163, 163, 255)',  // rgba(0, 0, 255, 0.36) blended with white
    'rgb(148, 148, 255)'   // rgba(0, 0, 255, 0.42) blended with white
];

export const DEPTH_COLORS_DARK = [
    'rgb(0, 0, 31)',   // rgba(0, 0, 255, 0.12) blended with black
    'rgb(0, 0, 46)',   // rgba(0, 0, 255, 0.18) blended with black
    'rgb(0, 0, 61)',   // rgba(0, 0, 255, 0.24) blended with black
    'rgb(0, 0, 77)',   // rgba(0, 0, 255, 0.30) blended with black
    'rgb(0, 0, 92)',   // rgba(0, 0, 255, 0.36) blended with black
    'rgb(0, 0, 107)'   // rgba(0, 0, 255, 0.42) blended with black
];

export const RESULT_GROUPS = [
    [ RESULT_GROUP_ISSUE, RESULT_GROUP_WORKER, RESULT_GROUP_QUEUE, RESULT_GROUP_PROJECT, RESULT_GROUP_ISSUE_TYPE, RESULT_GROUP_EPIC ],
    [ RESULT_GROUP_NONE, RESULT_GROUP_ISSUE, RESULT_GROUP_WORKER, RESULT_GROUP_QUEUE, RESULT_GROUP_PROJECT, RESULT_GROUP_ISSUE_TYPE, RESULT_GROUP_EPIC ],
    [ RESULT_GROUP_NONE, RESULT_GROUP_ISSUE, RESULT_GROUP_WORKER, RESULT_GROUP_QUEUE, RESULT_GROUP_PROJECT, RESULT_GROUP_ISSUE_TYPE, RESULT_GROUP_EPIC ],
    [ RESULT_GROUP_NONE, RESULT_GROUP_ISSUE, RESULT_GROUP_WORKER, RESULT_GROUP_QUEUE, RESULT_GROUP_PROJECT, RESULT_GROUP_ISSUE_TYPE, RESULT_GROUP_EPIC ],
    [ RESULT_GROUP_NONE, RESULT_GROUP_ISSUE, RESULT_GROUP_WORKER, RESULT_GROUP_QUEUE, RESULT_GROUP_PROJECT, RESULT_GROUP_ISSUE_TYPE, RESULT_GROUP_EPIC ],
    [ RESULT_GROUP_NONE, RESULT_GROUP_ISSUE, RESULT_GROUP_WORKER, RESULT_GROUP_QUEUE, RESULT_GROUP_PROJECT, RESULT_GROUP_ISSUE_TYPE, RESULT_GROUP_EPIC ],
];

export const DATE_FORMAT = "DD.MM.YYYY";

export const DATE_FORMAT_RU = "DD.MM.YYYY";
export const DATE_FORMAT_EN = "MM/DD/YYYY";

export const WEEKEND_WEEK_DAYS = [6, 7];

export const CREATE_WORK_LOG_FORM_TYPE_BASIC = "BASIC";
export const CREATE_WORK_LOG_FORM_TYPE_ADVANCED = "ADVANCED";

export const TASK_SEARCH_TYPE_BASE = "BASE";
export const TASK_SEARCH_TYPE_BOARD = "BOARD";

export const AUTHORIZED_STATE_DONE = "DONE";
export const AUTHORIZED_STATE_NONE = "NONE";
export const AUTHORIZED_STATE_NO_ORG_ID = "NO_ORG_ID";

export const EXPORT_VARIANT_AS_IS = "AS_IS";
export const EXPORT_VARIANT_ONE_ROW = "ONE_ROW";
export const EXPORT_VARIANT_ONE_ROW_WITH_DATE = "ONE_ROW_WITH_DATE";
export const EXPORT_VARIANT_SHORT = "SHORT";

export const EXPORT_VARIANTS = [
    EXPORT_VARIANT_AS_IS,
    EXPORT_VARIANT_ONE_ROW,
    EXPORT_VARIANT_ONE_ROW_WITH_DATE,
    EXPORT_VARIANT_SHORT
];

export const LOCALE_RU = "ru";
export const LOCALE_EN = "en";

export const LOCALES = [
    LOCALE_RU,
    LOCALE_EN,
];

export const COLOR_THEME_DARK = "dark";
export const COLOR_THEME_LIGHT = "light";

export const COLOR_THEMES = [
    COLOR_THEME_LIGHT,
    COLOR_THEME_DARK,
];

export const FILTER_FAST_DATES_TODAY = "TODAY";
export const FILTER_FAST_DATES_LAST_2_DAYS = "LAST_2_DAYS";
export const FILTER_FAST_DATES_LAST_7_DAYS = "LAST_7_DAYS";
export const FILTER_FAST_DATES_LAST_30_DAYS = "LAST_30_DAYS";
export const FILTER_FAST_DATES_LAST_90_DAYS = "LAST_90_DAYS";

export const FILTER_FAST_DATES = [
    FILTER_FAST_DATES_TODAY,
    FILTER_FAST_DATES_LAST_2_DAYS,
    FILTER_FAST_DATES_LAST_7_DAYS,
    FILTER_FAST_DATES_LAST_30_DAYS,
    FILTER_FAST_DATES_LAST_90_DAYS
];

export const VIRTUOSO_MIN_LENGTH = 200;

export const LOCALIZED_DATE_FORMATS = {
    [LOCALE_RU]: DATE_FORMAT_RU,
    [LOCALE_EN]: DATE_FORMAT_EN,
};