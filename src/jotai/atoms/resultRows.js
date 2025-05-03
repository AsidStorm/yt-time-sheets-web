import {atom} from "jotai";
import {processRows} from "../../helpers";
import {workLogsAtom} from "./workLogs";
import {queuesMapAtom} from "./queues";
import {dateFormatAtom} from "./dateFormat";
import {resultGroupsAtom} from "./resultGroups";
import {highlightTimeAtom} from "./highlightTime";
import {datesAtom} from "./dates";

export const resultRowsAtom = atom(get => {
    return processRows(
        get(workLogsAtom),
        get(queuesMapAtom),
        get(dateFormatAtom),
        get(resultGroupsAtom),
        get(highlightTimeAtom),
        get(datesAtom)
    );
});