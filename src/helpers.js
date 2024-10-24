import {TIME_FORMAT_HOURS, TIME_FORMAT_MONEY} from "./constants";

const replaceCumulative = (str, find, replace) => {
    for (let i = 0; i < find.length; i++) {
        str = str.replace(new RegExp(find[i],"g"), replace[i]);
    }

    return str;
};

export const pushAnalytics = (...args) => {
    const payload = ["event", ...args];

    if( !payload[2] ) {
        payload.push({
            owner: orgIdOwner()
        });
    } else if( !payload[2].owner ) {
        payload[2].owner = orgIdOwner();
    }

    window.gtag.apply(this, payload);
};

export const orgIdOwner = (specifiedOrgId) => {
    const orgId = specifiedOrgId ? specifiedOrgId : localStorage.getItem("orgId");
    const stringedOrgId = ("" + orgId).trim();


    if (stringedOrgId === "" || !orgId) {
        return "PUBLIC";
    }

    return "EXTERNAL";
};

export const replaceRuDuration = input => {
    return replaceCumulative(input, ['н', 'д', 'ч', 'м', 'с'], ['w', 'd', 'h', 'm', 's']);
};

export const extractDuration = duration => {
    const seconds = duration / 10e8; // Секунд
    const minutes = Math.ceil(seconds / 60); // Минут

    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainMinutes = minutes - (hours * 60);

        return { hours, minutes: remainMinutes, rawMinutes: minutes };
    }

    return { hours: 0, minutes, rawMinutes: minutes };
};

export const durationToISO = (duration) => {
    const { hours, minutes } = extractDuration(duration);

    if( hours > 0 ) {
        if( minutes > 0 ) {
            return `${hours}h ${minutes}m`;
        }

        return `${hours}h`;
    }

    return `${minutes}m`;
};

export const humanizeDuration = (duration, timeFormat, details, salaries) => {
    if( timeFormat === TIME_FORMAT_MONEY ) {
        let totalMoney = 0;
        let warning = false;

        for( const userId of Object.keys(details) ) {
            const salary = salaries[userId];

            if( !salary ) {
                warning = true;
                continue;
            }

            const value = details[userId];

            const { rawMinutes } = extractDuration(value);

            const salaryPerMinute = salary['*'] / 60;

            totalMoney += salaryPerMinute * rawMinutes;
        }

        return totalMoney.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ') + " ₽" + (warning ? " (!!!)" : "");
    }

    const { hours, minutes, rawMinutes } = extractDuration(duration);

    if (timeFormat === TIME_FORMAT_HOURS && hours > 0) {
        if( minutes > 0 ) {
            return `${hours} ч. ${minutes} м.`;
        }

        return `${hours} ч.`;
    }

    return `${rawMinutes} м.`
};

export const yandexTrackerIssueUrl = issueKey => {
    return `https://tracker.yandex.ru/${issueKey}`;
};

export const yandexTrackerQueueUrl = queue => {
    return `https://tracker.yandex.ru/${queue}`;
};

export const yandexTrackerProjectUrl = projectId => {
    return `https://tracker.yandex.ru/pages/projects/${projectId}`;
};

export const sleep = ms => new Promise(r => setTimeout(r, ms));
