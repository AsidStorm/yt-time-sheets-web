import { atom } from "jotai"

export const issueTypesMapAtom = atom({});
export const issueTypesAtom = atom( get => Object.values(get(issueTypesMapAtom)));