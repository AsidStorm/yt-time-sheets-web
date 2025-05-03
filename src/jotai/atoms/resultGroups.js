import {atom} from "jotai";
import {RESULT_GROUP_ISSUE, RESULT_GROUP_NONE} from "../../constants";

export const resultGroupsAtom = atom([RESULT_GROUP_ISSUE, RESULT_GROUP_NONE]);