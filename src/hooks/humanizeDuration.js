import {humanizeDuration} from "../helpers";
import {useAtomValue} from "jotai/react";
import {salaryMapAtom, timeFormatAtom} from "../jotai/atoms";
import {useTranslation} from "react-i18next";

export function useHumanizeDuration(override) {
    const {t} = useTranslation();

    const timeFormat = useAtomValue(timeFormatAtom);
    const salaryMap = useAtomValue(salaryMapAtom);

    const localizedHumanizeDuration = humanizeDuration(t, salaryMap);

    return (duration, owners = {}) => {
        const tf = typeof override === 'function' ? override(timeFormat) : timeFormat;

        return localizedHumanizeDuration(duration, tf, owners);
    };
}