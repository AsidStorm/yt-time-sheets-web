import {useAtom} from "jotai/index";
import {changelogDialogStateAtom} from "../jotai/atoms";

export function useChangelogDialog() {
    const [state, setState] = useAtom(changelogDialogStateAtom);

    const open = () => setState(true);
    const close = () => setState(false);

    return {
        open,
        close,

        isOpen: state
    };
}