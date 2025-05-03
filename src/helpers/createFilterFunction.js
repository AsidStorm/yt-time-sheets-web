const transliterateRuEn = text => {
    const ruToEnMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
        'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };

    return text.split('').map(char => ruToEnMap[char] || char).join('');
}

const transliterateEnRu = text => {
    const enToRuMap = {
        'a': 'а', 'b': 'б', 'c': 'ц', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г',
        'h': 'х', 'i': 'и', 'j': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н',
        'o': 'о', 'p': 'п', 'q': 'к', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у',
        'v': 'в', 'w': 'в', 'x': 'кс', 'y': 'ы', 'z': 'з',
        'yo': 'ё', 'zh': 'ж', 'ts': 'ц', 'ch': 'ч', 'sh': 'ш', 'sch': 'щ', 'yu': 'ю', 'ya': 'я'
    };

    let result = text;
    Object.entries(enToRuMap).sort((a, b) => b[0].length - a[0].length).forEach(([en, ru]) => {
        result = result.replace(new RegExp(en, 'g'), ru);
    });

    return result;
}

const convertKeyboardLayout = (text, fromLayout, toLayout) => {
    const layoutMaps = {
        'ru-en': {
            'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p',
            'х': '[', 'ъ': ']', 'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k',
            'д': 'l', 'ж': ';', 'э': "'", 'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm',
            'б': ',', 'ю': '.', 'ё': '`', '.': '/', ',': '?'
        },
        'en-ru': {
            'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з',
            '[': 'х', ']': 'ъ', 'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л',
            'l': 'д', ';': 'ж', "'": 'э', 'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь',
            ',': 'б', '.': 'ю', '`': 'ё', '/': '.', '?': ','
        }
    };

    const mapKey = `${fromLayout}-${toLayout}`;
    const mapping = layoutMaps[mapKey] || {};

    return text.split('').map(char => mapping[char] || char).join('');
}

const generateSearchVariants = text => {
    const variants = new Set();

    variants.add(transliterateRuEn(text));
    variants.add(transliterateEnRu(text));

    variants.add(convertKeyboardLayout(text, 'ru', 'en'));
    variants.add(convertKeyboardLayout(text, 'en', 'ru'));

    const transliterated = transliterateRuEn(text);
    variants.add(convertKeyboardLayout(transliterated, 'en', 'ru'));

    return Array.from(variants).filter(v => v && v !== text);
}

export const createLabelFilter = (filterText, inputLabel) => {
    const normalizedFilter = filterText.toLowerCase().trim();

    if (!normalizedFilter) {
        return () => true;
    }

    return (input) => {
        const rawLabel = inputLabel(input);
        if (!rawLabel) return false;

        const label = rawLabel.toString().toLowerCase();

        if (label.includes(normalizedFilter)) {
            return true;
        }

        const variants = generateSearchVariants(normalizedFilter);
        for (const variant of variants) {
            if (label.includes(variant)) {
                return true;
            }
        }

        return false;
    };
}