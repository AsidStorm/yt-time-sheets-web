import {useAtom} from "jotai";
import {settingsDialogStateAtom} from "../jotai/atoms";

export function useAddQueryToFavoriteDialog() {
    const [state, setState] = useAtom(settingsDialogStateAtom);

    const open = () => setState(true);
    const close = () => setState(false);

    return {
        open,
        close,

        isOpen: state
    };
}