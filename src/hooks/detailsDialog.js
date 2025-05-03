import {useAtom} from "jotai";
import {detailsDataAtom, detailsStateAtom} from "../jotai/atoms";
export function useDetailsDialog() {
    const [ state, setState ] = useAtom(detailsStateAtom);
    const [ data, setData ] = useAtom(detailsDataAtom);

    const open = (row, date, index) => {
        setData({
            row,
            date,
            index
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