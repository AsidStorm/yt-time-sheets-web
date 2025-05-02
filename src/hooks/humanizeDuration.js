import {humanizeDuration} from "../helpers";
import {useAtomValue} from "jotai/react";
import {timeFormatAtom} from "../jotai/atoms";
import {useTranslation} from "react-i18next";

export function useHumanizeDuration(override) {
    const timeFormat = useAtomValue(timeFormatAtom);
    const {t} = useTranslation();


    const localizedHumanizeDuration = humanizeDuration(t);

    return (duration) => {
        const tf = typeof override === 'function' ? override(timeFormat) : timeFormat;

        return localizedHumanizeDuration(duration, tf);
    };
}