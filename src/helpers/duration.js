import {TIME_FORMAT_HOURS} from "../constants";

const extractDuration = duration => {
    const seconds = duration / 10e8;
    const minutes = Math.ceil(seconds / 60);

    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainMinutes = minutes - (hours * 60);

        return { hours, minutes: remainMinutes, rawMinutes: minutes };
    }

    return { hours: 0, minutes, rawMinutes: minutes };
};

export const extractRawMinutesFromDuration = duration => {
    const { rawMinutes } = extractDuration(duration);

    return rawMinutes;
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

export const humanizeDuration = (t) => (duration, timeFormat) => {
    const { hours, minutes, rawMinutes } = extractDuration(duration);

    if (timeFormat === TIME_FORMAT_HOURS && hours > 0) {
        if( minutes > 0 ) {
            return t('duration:hours_and_minutes', { hours, minutes });
        }

        return t('duration:hours', { hours });
    }

    return t('duration:minutes', { minutes: rawMinutes });
};