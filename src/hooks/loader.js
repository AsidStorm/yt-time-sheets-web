import {useAtom} from "jotai";
import {loaderAtom, loaderValueAtom} from "../jotai/atoms";

export function useLoader() {
    const [ loader, setLoader ] = useAtom(loaderAtom);
    const [ loaderValue, setLoaderValue ] = useAtom(loaderValueAtom);

    return {
        startLoading: () => setLoader(true),
        endLoading: () => {
            setLoaderValue(-1);
            setLoader(false);
        },
        setLoadingValue: value => {
            setLoaderValue(value);
        },

        state: loader,
        value: loaderValue
    };
}