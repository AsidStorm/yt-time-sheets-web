import {atom} from "jotai";

export const messageAtom = atom({
    open: false,
    value: "",
    type: "success"
});