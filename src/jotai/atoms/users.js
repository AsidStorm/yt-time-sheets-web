import { atom } from "jotai"

export const usersMapAtom = atom({});
export const usersAtom = atom( get => Object.values(get(usersMapAtom)));
export const selectedUsersAtom = atom([]);
export const myUserAtom = atom({
    value: -1,
    label: "",
    isReadOnly: true,
    isAdmin: false
});