export const generateMoments = (start, end, step) => {
    const variableMoment = start.clone();

    return {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            if (variableMoment >= end) {
                if (!variableMoment.isAfter(end)) {
                    const result = { value: variableMoment.clone(), done: false };
                    variableMoment.add(step); // Move past the end to ensure we break next time
                    return result;
                }
                return { value: undefined, done: true };
            }

            const result = { value: variableMoment.clone(), done: false };
            variableMoment.add(step);
            return result;
        }
    };
};