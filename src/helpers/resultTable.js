import {COLOR_THEME_DARK, DATE_FORMAT_MONTH, DEPTH_COLORS, DEPTH_COLORS_DARK, WEEKEND_WEEK_DAYS} from "../constants";


export const isLastRowCaller = rows => index => rows.length - 1 === index;
export const rowDateExists = (row, date) => !!row.byDate[date.index];

export const rowHaveDetails = (row, date) => rowDateExists(row, date) && row.byDate[date.index].details && row.byDate[date.index].details.length > 0;

export const rowSx = (row, index) => {
    if( row.isMaxDepth || row.isSummary ) {
        if( (index+1) %2 === 0 ) {
            return {
                background: theme => theme.palette.mode === COLOR_THEME_DARK ? '#1E1E1E' : 'rgb(245, 245, 245)' //'rgba(0, 0, 0, 0.04)'
            };
        }

        return {
            background: theme => theme.palette.mode === COLOR_THEME_DARK ? 'black' : 'white'
        };
    }

    return {
        background: theme => theme.palette.mode === COLOR_THEME_DARK ? DEPTH_COLORS_DARK[row.depth] : DEPTH_COLORS[row.depth]
    };
};

export const daySx = (day, isLastRow, isUnexpectedDuration) => {
    const out = {
        width: 150
    };

    const isWeekend = day.grouped ? false : WEEKEND_WEEK_DAYS.includes(day.includes[0].isoWeekday());

    if ( isWeekend ) {
        out.backgroundColor = theme => theme.palette.mode === 'dark' ? 'weekend.dark' : 'weekend.light';
    }

    if( !isLastRow && isUnexpectedDuration === true ) {
        out.background = "rgba(255,0,0,.3);";
    }

    return out;
};

export const calculateDetailsCols = (readOnly, haveWorkerInChain, haveIssueInChain, dateFormat) => {
    let cols = 6;

    if( readOnly ) {
        cols--;
    }

    if( haveWorkerInChain ) {
        cols--;
    }

    if( haveIssueInChain ) {
        cols--;
    }

    if( dateFormat === DATE_FORMAT_MONTH ) {
        cols++;
    }

    return cols;
}