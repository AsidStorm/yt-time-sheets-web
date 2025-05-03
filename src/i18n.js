import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import commonRu from "./locale/ru/common.json";
import filterRu from "./locale/ru/filter.json";
import exportRu from "./locale/ru/export.json";
import copyrightRu from "./locale/ru/copyright.json";
import chartsRu from "./locale/ru/charts.json";
import notificationsRu from "./locale/ru/notifications.json";
import componentsRu from "./locale/ru/components.json";
import durationRu from "./locale/ru/duration.json";
import changelogRu from "./locale/ru/changelog.json";
import commonEn from "./locale/en/common.json";
import filterEn from "./locale/en/filter.json";
import exportEn from "./locale/en/export.json";
import copyrightEn from "./locale/en/copyright.json";
import chartsEn from "./locale/en/charts.json";
import notificationsEn from "./locale/en/notifications.json";
import componentsEn from "./locale/en/components.json";
import durationEn from "./locale/en/duration.json";
import changelogEn from "./locale/en/changelog.json";
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
        duration: durationRu,
        changelog: changelogRu,
    },
    en: {
        common: commonEn,
        filter: filterEn,
        export: exportEn,
        copyright: copyrightEn,
        charts: chartsEn,
        notifications: notificationsEn,
        components: componentsEn,
        duration: durationEn,
        changelog: changelogEn,
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('yt-time-sheets/locale') ? JSON.parse(localStorage.getItem('yt-time-sheets/locale')) : LOCALE_RU,
        fallbackLng: LOCALE_RU,

        interpolation: {
            escapeValue: false
        }
    });

export default i18n;