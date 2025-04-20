import {humanizeDuration} from "../helpers";
import {useAtomValue} from "jotai/react";
import {timeFormatAtom} from "../jotai/atoms";

export function useHumanizeDuration(override) {
    const timeFormat = useAtomValue(timeFormatAtom);

    return (duration) => {
        const tf = typeof override === 'function' ? override(timeFormat) : timeFormat;

        return humanizeDuration(duration, tf);
    };
}