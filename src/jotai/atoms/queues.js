import { atom } from "jotai"

export const queuesMapAtom = atom({});
export const queuesAtom = atom( get => Object.values(get(queuesMapAtom)));