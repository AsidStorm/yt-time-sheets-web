import React, {forwardRef, Fragment} from "react";
import {Button, TableCell} from "@mui/material";
import Tooltip, {tooltipClasses} from "@mui/material/Tooltip";
import {styled} from "@mui/material/styles";
import {useAtomValue} from "jotai";
import {daySx, isLastRowCaller, rowDateExists} from "../../helpers";
import {ResultDetailsTable} from "./DetailsTable";
import {RESULT_GROUP_WORKER} from "../../constants";
import {ResultTableRowTitle} from "./RowTitle";
import {useHumanizeDuration, useDetailsDialog} from "../../hooks";
import {datesAtom, resultRowsAtom, hideDetailsAtom, highlightTimeAtom} from "../../jotai/atoms";

const HtmlTooltip = styled(({className, ...props}) => (
    <Tooltip {...props} classes={{popper: className}}/>
))(({theme}) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: 'rgba(0,0,0,0)',
        maxWidth: 750,
    },
}));

export function ResultTableRowContent({index, row, setInsightRow, setInsightDialog}) {
    const humanize = useHumanizeDuration();

    const rows = useAtomValue(resultRowsAtom);
    const dates = useAtomValue(datesAtom);
    const hideDetails = useAtomValue(hideDetailsAtom);

    const highlightTime = useAtomValue(highlightTimeAtom);

    const {open: openDetailsDialog} = useDetailsDialog();

    const isLastRow = isLastRowCaller(rows);

    const TimeButton = forwardRef(function TimeButton(props, ref) {
        const {row, date} = props;

        return <Button
            {...props}
            ref={ref}
            onClick={() => openDetailsDialog(row, date, index)}
        >
            {rowDateExists(row, date) && row.byDate[date.index].value > 0 ? humanize(row.byDate[date.index].value, row.byDate[date.index].byCreatedBy) : "---"}
        </Button>
    });

    function CellTooltip({row, date}) {
        if (hideDetails) {
            return <TimeButton row={row} date={date}/>
        }

        return <HtmlTooltip
            title={<ResultDetailsTable index={index} row={row} date={date}/>}
        >
            <TimeButton row={row} date={date}/>
        </HtmlTooltip>
    }

    const highlightLessThanMinutes = highlightTime !== false && row.parameters && row.parameters.resultGroup === RESULT_GROUP_WORKER ? highlightTime.minute() + (highlightTime.hour() * 60) : 0;

    return <Fragment>
        <ResultTableRowTitle row={row} setInsightRow={setInsightRow} setInsightDialog={setInsightDialog}/>

        {dates.map(date => <TableCell align="center"
                                      sx={daySx(date, isLastRow(index), rowDateExists(row, date) ? rowDateExists(row, date) && row.byDate[date.index].value : 0, highlightLessThanMinutes)}
                                      key={`table-cell-${index}-${date.index}-${row.title}`}>
            {!isLastRow(index) && row.isMaxDepth && <CellTooltip row={row} date={date}/>}
            {(isLastRow(index) || !row.isMaxDepth) && <Button disabled={true} sx={{color: "black !important"}}>
                {rowDateExists(row, date) && row.byDate[date.index].value > 0 ? humanize(row.byDate[date.index].value, row.byDate[date.index].byCreatedBy) : "---"}
            </Button>}
        </TableCell>)}

        <TableCell align="right">
            {humanize(row.value, row.byCreatedBy)}
        </TableCell>
    </Fragment>
}