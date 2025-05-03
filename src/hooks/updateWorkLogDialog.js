import {useAtom} from "jotai";
import {updateWorkLogStateAtom, updateWorkLogDataAtom} from "../jotai/atoms";

export function useUpdateWorkLogDialog() {
    const [ state, setState ] = useAtom(updateWorkLogStateAtom);
    const [ data, setData ] = useAtom(updateWorkLogDataAtom);

    const open = (detail) => {
        setData({
            workLogId: detail.workLogId,
            issueKey: detail.issueKey,
            issueTitle: detail.issueTitle,
            createdById: detail.createdById,
            createdByDisplay: detail.createdByDisplay,
            value: detail.value,
            comment: detail.description
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