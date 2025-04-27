import {useAtom} from "jotai";
import {createWorkLogDataAtom, createWorkLogStateAtom} from "../jotai/atoms";
import {RESULT_GROUP_WORKER} from "../constants";

export function useCreateWorkLogDialog() {
    const [state, setState] = useAtom(createWorkLogStateAtom);
    const [data, setData] = useAtom(createWorkLogDataAtom);

    const open = (row, date) => {
        setData({
            duration: "",
            comment: "",
            createdById: row.parameters.resultGroup === RESULT_GROUP_WORKER ? row.extra.createdById : null,
            issueKey: row.extra.issueKey,
            date: date,
            issueTitle: row.title,
        });
        setState(true);
    };
    const close = () => setState(false);

    return {
        open,
        close,

        isOpen: state,
        ...data,
    };
}