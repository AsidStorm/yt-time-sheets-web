import {useAtom} from "jotai/index";
import {insightsDataAtom, insightsStateAtom} from "../jotai/atoms";

export function useInsightsDialog() {
    const [state, setState] = useAtom(insightsStateAtom);
    const [data, setData] = useAtom(insightsDataAtom);

    const open = () => {
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