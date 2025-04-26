import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import commonRu from "./locale/ru/common.json";
import filterRu from "./locale/ru/filter.json";
import exportRu from "./locale/ru/export.json";
import copyrightRu from "./locale/ru/copyright.json";
import chartsRu from "./locale/ru/charts.json";
import notificationsRu from "./locale/ru/notifications.json";
import componentsRu from "./locale/ru/components.json";
import {LOCALE_RU} from "./constants";

const resources = {
    ru: {
        common: commonRu,
        filter: filterRu,
        export: exportRu,
        copyright: copyrightRu,
        charts: chartsRu,
        notifications: notificationsRu,
        components: componentsRu,
    },
    en: {

    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('yt-time-sheets/locale') ?? LOCALE_RU,
        fallbackLng: LOCALE_RU,

        interpolation: {
            escapeValue: false
        }
    });

export default i18n;