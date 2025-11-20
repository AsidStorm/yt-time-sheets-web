import {useAtom} from "jotai";
import {groupsDialogStateAtom} from "../jotai/atoms";

export function useGroupsDialog() {
    const [state, setState] = useAtom(groupsDialogStateAtom);

    const open = () => setState(true);
    const close = () => setState(false);

    return {
        open,
        close,

        isOpen: state
    };
}