import {useAtom} from "jotai/index";
import {settingsDialogStateAtom} from "../jotai/atoms";

export function useSettingsDialog() {
    const [state, setState] = useAtom(settingsDialogStateAtom);

    const open = () => setState(true);
    const close = () => setState(false);

    return {
        open,
        close,

        isOpen: state
    };
}