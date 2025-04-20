const replaceCumulative = (str, find, replace) => {
    for (let i = 0; i < find.length; i++) {
        str = str.replace(new RegExp(find[i],"g"), replace[i]);
    }

    return str;
};

export const replaceRuDuration = input => {
    return replaceCumulative(input, ['н', 'д', 'ч', 'м', 'с'], ['w', 'd', 'h', 'm', 's']);
};