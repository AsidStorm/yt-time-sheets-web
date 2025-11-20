import {atom} from "jotai"

export const boardsMapAtom = atom({});
export const boardsAtom = atom(get => Object.values(get(boardsMapAtom)));
export const boardsLoadedAtom = atom(false);