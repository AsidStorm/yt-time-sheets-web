import {atom} from "jotai"

export const issueStatusesMapAtom = atom({});
export const issueStatusesAtom = atom(get => Object.values(get(issueStatusesMapAtom)));