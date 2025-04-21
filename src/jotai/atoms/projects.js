import {atom} from "jotai"

export const projectsMapAtom = atom({});
export const projectsAtom = atom(get => Object.values(get(projectsMapAtom)));