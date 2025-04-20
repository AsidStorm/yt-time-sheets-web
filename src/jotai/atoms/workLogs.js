import {atom} from "jotai";

export const workLogsAtom = atom([]);
export const haveWorkLogsAtom = atom(get => get(workLogsAtom).length > 0);