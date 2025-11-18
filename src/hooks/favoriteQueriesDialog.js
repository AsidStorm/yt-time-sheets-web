import {useAtom} from "jotai";
import {favoriteQueriesStateAtom} from "../jotai/atoms";

export function useFavoriteQueriesDialog() {
    const [state, setState] = useAtom(favoriteQueriesStateAtom);

    const open = () => setState(true);
    const close = () => setState(false);

    return {
        open,
        close,

        isOpen: state
    };
}