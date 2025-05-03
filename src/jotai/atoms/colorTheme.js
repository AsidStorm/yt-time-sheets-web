import {atomWithStorage} from 'jotai/utils'
import {COLOR_THEME_LIGHT} from "../../constants";

export const colorThemeAtom = atomWithStorage('yt-time-sheets/color-theme', COLOR_THEME_LIGHT);