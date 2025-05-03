import {atom} from "jotai";
import {atomWithStorage} from "jotai/utils";

export const insightsStateAtom = atom(false);
export const insightsDataAtom = atom({});
export const insightsEnabledAtom = atomWithStorage('yt-time-sheets/insights', true);