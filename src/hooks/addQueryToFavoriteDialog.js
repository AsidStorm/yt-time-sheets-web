import {useAtom} from "jotai";
import {addQueryToFavoriteQueryAtom, addQueryToFavoriteStateAtom} from "../jotai/atoms";

export function useAddQueryToFavoriteDialog() {
    const [state, setState] = useAtom(addQueryToFavoriteStateAtom);
    const [query, setQuery] = useAtom(addQueryToFavoriteQueryAtom);

    const open = value => {
        setQuery(value);
        setState(true);
    };
    const close = () => setState(false);

    return {
        open,
        close,

        query,

        isOpen: state
    };
}