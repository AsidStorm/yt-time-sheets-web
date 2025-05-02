import {useAtomValue} from "jotai";
import {dateFormatAtom, localeAtom} from "../jotai/atoms";
import {DATE_FORMAT_EN, DATE_FORMAT_MONTH, DATE_FORMAT_RU, LOCALE_EN, LOCALE_RU} from "../constants";
import {useTranslation} from "react-i18next";

export function useDateFormatter() {
    const dateFormat = useAtomValue(dateFormatAtom);
    const locale = useAtomValue(localeAtom);

    const {t} = useTranslation();

    const dateFormats = {
        [LOCALE_RU]: DATE_FORMAT_RU,
        [LOCALE_EN]: DATE_FORMAT_EN
    }

    const formatDate = ({ date }) => {
        if( dateFormat === DATE_FORMAT_MONTH ) {
            return t('common:month_with_year', {
                month: t(`common:month.${date.month()}`),
                year: date.format("YYYY")
            });
        }

        return date.format(dateFormats[locale]);
    };

    return {
        formatDate
    };
}