import {useAtom} from "jotai/index";
import {insightsDataAtom, insightsStateAtom} from "../jotai/atoms";

export function useInsightsDialog() {
    const [state, setState] = useAtom(insightsStateAtom);
    const [data, setData] = useAtom(insightsDataAtom);

    const open = row => {
        setState(true);
        setData({ row });
    };
    const close = () => setState(false);

    return {
        open,
        close,

        isOpen: state,
        ...data,
    };
}