import {atom} from "jotai"
import {atomWithStorage} from 'jotai/utils'

export const groupsMapAtom = atom({});
export const favoriteGroupsAtom = atomWithStorage('yt-time-sheets/favorite-groups', []);
export const groupsAtom = atom(get => Object.values(get(groupsMapAtom)));
export const orderedGroupsAtom = atom(get => {
    const groups = get(groupsMapAtom);
    const favorites = get(favoriteGroupsAtom);

    const out = {
        favorites: [],
        other: []
    };

    for (const favorite of favorites) {
        if (groups[favorite]) {
            out.favorites.push({...groups[favorite], isFavorite: true});
        }
    }

    for (const groupId of Object.keys(groups)) {
        if (!favorites.includes(groupId)) {
            out.other.push({...groups[groupId], isFavorite: false});
        }
    }

    out.favorites.sort((a, b) => a.label.localeCompare(b.label));
    out.other.sort((a, b) => a.label.localeCompare(b.label));

    return [...out.favorites, ...out.other];
});