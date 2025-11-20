import {humanizeDuration} from "../helpers";
import {useAtomValue} from "jotai";
import {timeFormatAtom} from "../jotai/atoms";
import {useTranslation} from "react-i18next";

export function useHumanizeDuration(override) {
    const {t} = useTranslation();

    const timeFormat = useAtomValue(timeFormatAtom);

    const localizedHumanizeDuration = humanizeDuration(t);

    return (duration, owners = {}) => {
        const tf = typeof override === 'function' ? override(timeFormat) : timeFormat;

        return localizedHumanizeDuration(duration, tf, owners);
    };
}