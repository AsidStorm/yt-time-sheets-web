import { atomWithStorage } from 'jotai/utils'
import {LOCALE_RU} from "../../constants";

export const localeAtom = atomWithStorage('yt-time-sheets/locale', LOCALE_RU);