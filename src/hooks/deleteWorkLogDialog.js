import {useAtom} from "jotai";
import {deleteWorkLogDetailAtom, deleteWorkLogStateAtom} from "../jotai/atoms";

export function useDeleteWorkLogDialog() {
    const [ state, setState ] = useAtom(deleteWorkLogStateAtom);
    const [ detail, setDetail ] = useAtom(deleteWorkLogDetailAtom);

    const open = detail => {
        setDetail(detail);
        setState(true);
    };
    const close = () => setState(false);

    return {
        open,
        close,

        isOpen: state,
        workLogId: detail.workLogId,
        issueKey: detail.issueKey,
        createdById: detail.createdById,
        createdByDisplay: detail.createdByDisplay,
        issueTitle: detail.issueTitle,
        value: detail.value
    };
}