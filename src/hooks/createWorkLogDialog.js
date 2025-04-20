import {useAtom} from "jotai";
import {createWorkLogDataAtom, createWorkLogStateAtom} from "../jotai/atoms";
export function useCreateWorkLogDialog() {
    const [ state, setState ] = useAtom(createWorkLogStateAtom);
    const [ data, setData ] = useAtom(createWorkLogDataAtom);

    const open = (row, date) => {
        setData({
            duration: "",
            comment: "",
            createdById: row.extra.createdById,
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