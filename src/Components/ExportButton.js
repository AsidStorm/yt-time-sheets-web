import React, {Fragment, useRef, useState} from "react";
import {extractRawMinutesFromDuration, pushAnalytics, rowDateExists} from "../helpers";
import {Button, MenuList, MenuItem, Paper, Popper, Grow, ClickAwayListener} from "@mui/material";
import {
    EXPORT_VARIANT_AS_IS,
    EXPORT_VARIANT_ONE_ROW,
    EXPORT_VARIANT_ONE_ROW_WITH_DATE,
    EXPORT_VARIANT_SHORT,
    EXPORT_VARIANTS,
    RESULT_GROUP_EPIC,
    RESULT_GROUP_ISSUE, RESULT_GROUP_ISSUE_TYPE,
    RESULT_GROUP_NONE, RESULT_GROUP_PROJECT,
    RESULT_GROUP_QUEUE,
    RESULT_GROUP_WORKER, RESULT_GROUPS_TRANSLATIONS
} from "../constants";
import {useTranslation} from "react-i18next";
import {useAtomValue} from "jotai";
import {datesAtom, resultGroupsAtom, resultRowsAtom, usersMapAtom} from "../jotai/atoms";
import {useDateFormatter} from "../hooks";

export function ExportButton() {
    const { t } = useTranslation();

    const resultGroups = useAtomValue(resultGroupsAtom);
    const usersMap = useAtomValue(usersMapAtom);
    const rows = useAtomValue(resultRowsAtom);
    const dates = useAtomValue(datesAtom);

    const { formatDate } = useDateFormatter();

    const anchorRef = useRef(null);

    const [exportOpen, setExportOpen] = useState(false);

    const exportDataAsIs = () => {
        const header = [
            "Ключ типа", "Тип" // В заголовках AS IS всегда есть тип строки
        ];

        const haveEpicInResultGroups = resultGroups.includes(RESULT_GROUP_EPIC);

        for( const resultGroup of resultGroups ) {
            if( resultGroup === RESULT_GROUP_NONE ) {
                break;
            }

            if( resultGroup === RESULT_GROUP_ISSUE ) {
                if( !haveEpicInResultGroups ) {
                    header.push("Ключ эпика задачи");
                    header.push("Описание эпика задачи");
                }

                header.push("Ключ задачи");
                header.push("Описание задачи");
            } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                header.push("Ключ очереди");
                header.push("Описание очереди");
            } else if( resultGroup === RESULT_GROUP_WORKER ) {
                header.push("ID сотрудника");
                header.push("Email сотрудника");
                header.push("ФИО сотрудника");
            } else if( resultGroup === RESULT_GROUP_EPIC ) {
                header.push("Ключ эпика");
                header.push("Описание эпика");
            } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                header.push("ID проекта");
                header.push("Название проекта");
            } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                header.push("ID Типа задачи");
                header.push("Ключ типа задачи");
                header.push("Тип задачи");
            }
        }

        for( const date of dates ) {
            header.push(formatDate(date));
        }

        header.push("Итого");

        const csv = [
            header.join(";")
        ];

        for( const row of rows ) {
            const parts = [];

            // Тут сложность - надо понять что было ДО, и что будет ПОСЛЕ, что бы заполнить пустые места дефисами

            if( row.isSummary ) {
                parts.push("SUMMARY");
                parts.push("Итого");

                for( const resultGroup of resultGroups ) { // Тут всегда дефисы
                    if( resultGroup === RESULT_GROUP_NONE ) {
                        break;
                    }

                    if( resultGroup === RESULT_GROUP_ISSUE ) {
                        if( !haveEpicInResultGroups ) {
                            parts.push("-");
                            parts.push("-");
                        }

                        parts.push("-");
                        parts.push("-");
                    } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_WORKER ) {
                        parts.push("-");
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_EPIC ) {
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                        parts.push("-");
                        parts.push("-");
                        parts.push("-");
                    }
                }
            } else {
                const { resultGroup: currentResultGroup } = row.parameters;

                parts.push(currentResultGroup);
                parts.push(RESULT_GROUPS_TRANSLATIONS[currentResultGroup]);

                // А тут мы заполняем ТОЛЬКО в том случае если у нас текущий resultGroup === resultGroup, в противном случае -

                for( const resultGroup of resultGroups ) {
                    if( resultGroup === RESULT_GROUP_NONE ) {
                        break;
                    }

                    if( resultGroup === RESULT_GROUP_ISSUE ) {
                        if( !haveEpicInResultGroups ) {
                            parts.push(row.extra.epicKey && currentResultGroup === resultGroup ? row.extra.epicKey : "-");
                            parts.push(row.extra.epicDisplay && currentResultGroup === resultGroup ? row.extra.epicDisplay : "-");
                        }

                        parts.push(currentResultGroup === resultGroup ? row.extra.issueKey : "-");
                        parts.push(currentResultGroup === resultGroup ? row.extra.issueTitle : "-");
                    } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                        parts.push(currentResultGroup === resultGroup ? row.extra.queue : "-");
                        parts.push(currentResultGroup === resultGroup ? row.extra.queueName : "-");
                    } else if( resultGroup === RESULT_GROUP_WORKER ) {
                        const user = usersMap[parseInt(row.extra.createdById)];

                        parts.push(currentResultGroup === resultGroup ? row.extra.createdById : "-");
                        parts.push(currentResultGroup === resultGroup ? user.email : "-");
                        parts.push(currentResultGroup === resultGroup ? row.extra.createdByDisplay : "-");
                    } else if( resultGroup === RESULT_GROUP_EPIC ) {
                        parts.push(row.extra.epicKey && currentResultGroup === resultGroup ? row.extra.epicKey : "-");
                        parts.push(row.extra.epicDisplay && currentResultGroup === resultGroup ? row.extra.epicDisplay : "-");
                    } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                        parts.push(row.extra.projectId && currentResultGroup === resultGroup ? row.extra.projectId : "-");
                        parts.push(row.extra.projectName && currentResultGroup === resultGroup ? row.extra.projectName : "-");
                    } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                        parts.push(row.extra.issueTypeId && currentResultGroup === resultGroup ? row.extra.issueTypeId : "-");
                        parts.push(row.extra.issueTypeKey && currentResultGroup === resultGroup ? row.extra.issueTypeKey : "-");
                        parts.push(row.extra.issueTypeDisplay && currentResultGroup === resultGroup ? row.extra.issueTypeDisplay : "-");
                    }
                }
            }

            // Мы сдвигаем каждый раз и ставим элементы на свои позиции
            for( const date of dates ) {
                parts.push(extractRawMinutesFromDuration(rowDateExists(row, date) ? row.byDate[date.index].value : 0));
            }

            parts.push( extractRawMinutesFromDuration(row.value) );

            csv.push(parts.join(";"));
        }

        return csv;
    };

    const exportDataOneRow = () => {
        // В одну строчку ВСЁ очень просто
        // Мы перечисляем все resultGroups в начале
        const header = [];

        const haveEpicInResultGroups = resultGroups.includes(RESULT_GROUP_EPIC);

        for( const resultGroup of resultGroups ) {
            if( resultGroup === RESULT_GROUP_NONE ) {
                break;
            }

            if( resultGroup === RESULT_GROUP_ISSUE ) {
                if( !haveEpicInResultGroups ) {
                    header.push("Ключ эпика задачи");
                    header.push("Описание эпика задачи");
                }

                header.push("Ключ задачи");
                header.push("Описание задачи");
            } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                header.push("Ключ очереди");
                header.push("Описание очереди");
            } else if( resultGroup === RESULT_GROUP_WORKER ) {
                header.push("ID сотрудника");
                header.push("Email сотрудника");
                header.push("ФИО сотрудника");
            } else if( resultGroup === RESULT_GROUP_EPIC ) {
                header.push("Ключ эпика");
                header.push("Описание эпика");
            } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                header.push("ID проекта");
                header.push("Название проекта");
            } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                header.push("ID Типа задачи");
                header.push("Ключ типа задачи");
                header.push("Тип задачи");
            }
        }

        for( const date of dates ) {
            header.push(formatDate(date));
        }

        header.push("Итого");

        const csv = [
            header.join(";")
        ];

        for( const row of rows ) {
            if( !row.isMaxDepth && !row.isSummary ) {
                continue;
            }

            const parts = [];

            if( row.isSummary ) {
                parts.push("Итого");

                let offset = 0;

                for (const resultGroup of resultGroups) {
                    if (resultGroup === RESULT_GROUP_NONE) {
                        break;
                    }

                    if (resultGroup === RESULT_GROUP_ISSUE) {
                        if (!haveEpicInResultGroups) {
                            offset+=2;
                        }

                        offset+=2;
                    } else if (resultGroup === RESULT_GROUP_QUEUE) {
                        offset+=2;
                    } else if (resultGroup === RESULT_GROUP_WORKER) {
                        offset+=3;
                    } else if (resultGroup === RESULT_GROUP_EPIC) {
                        offset+=2;
                    } else if (resultGroup === RESULT_GROUP_PROJECT) {
                        offset+=2;
                    } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                        offset+=3;
                    }
                }

                offset--; // За строчку Итого

                while (offset > 0 ) {
                    offset--;

                    parts.push("-");
                }
            } else {
                for (const resultGroup of resultGroups) {
                    if (resultGroup === RESULT_GROUP_NONE) {
                        break;
                    }

                    if (resultGroup === RESULT_GROUP_ISSUE) {
                        if (!haveEpicInResultGroups) {
                            parts.push(row.extra.epicKey ? row.extra.epicKey : "-");
                            parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : "-");
                        }

                        parts.push(row.extra.issueKey);
                        parts.push(row.extra.issueTitle);
                    } else if (resultGroup === RESULT_GROUP_QUEUE) {
                        parts.push(row.extra.queue);
                        parts.push(row.extra.queueName);
                    } else if (resultGroup === RESULT_GROUP_WORKER) {
                        const user = usersMap[parseInt(row.extra.createdById)];

                        parts.push(row.extra.createdById);
                        parts.push(user.email);
                        parts.push(row.extra.createdByDisplay);
                    } else if (resultGroup === RESULT_GROUP_EPIC) {
                        parts.push(row.extra.epicKey ? row.extra.epicKey : "-");
                        parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : "-");
                    } else if (resultGroup === RESULT_GROUP_PROJECT) {
                        parts.push(row.extra.projectId ? row.extra.projectId : "-");
                        parts.push(row.extra.projectName ? row.extra.projectName : "-");
                    } else if(resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                        parts.push(row.extra.issueTypeId ? row.extra.issueTypeId : "-");
                        parts.push(row.extra.issueTypeKey ? row.extra.issueTypeKey : "-");
                        parts.push(row.extra.issueTypeDisplay ? row.extra.issueTypeDisplay : "-");
                    }
                }
            }

            // Мы сдвигаем каждый раз и ставим элементы на свои позиции
            for (const date of dates) {
                parts.push(extractRawMinutesFromDuration(rowDateExists(row, date) ? row.byDate[date.index].value : 0));
            }

            parts.push( extractRawMinutesFromDuration(row.value) );

            csv.push(parts.join(";"));
        }

        return csv;
    };

    const exportDataOneRowWithDate = () => {
        // В одну строчку ВСЁ очень просто
        // Мы перечисляем все resultGroups в начале
        const header = [];

        const haveEpicInResultGroups = resultGroups.includes(RESULT_GROUP_EPIC);

        for( const resultGroup of resultGroups ) {
            if( resultGroup === RESULT_GROUP_NONE ) {
                break;
            }

            if( resultGroup === RESULT_GROUP_ISSUE ) {
                if( !haveEpicInResultGroups ) {
                    header.push("Ключ эпика задачи");
                    header.push("Описание эпика задачи");
                }

                header.push("Ключ задачи");
                header.push("Описание задачи");
            } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                header.push("Ключ очереди");
                header.push("Описание очереди");
            } else if( resultGroup === RESULT_GROUP_WORKER ) {
                header.push("ID сотрудника");
                header.push("Email сотрудника");
                header.push("ФИО сотрудника");
            } else if( resultGroup === RESULT_GROUP_EPIC ) {
                header.push("Ключ эпика");
                header.push("Описание эпика");
            } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                header.push("ID проекта");
                header.push("Название проекта");
            } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                header.push("ID Типа задачи");
                header.push("Ключ типа задачи");
                header.push("Тип задачи");
            }
        }

        header.push("Дата");
        header.push("Значение");

        const csv = [
            header.join(";")
        ];

        for( const row of rows ) {
            if( !row.isMaxDepth || row.isSummary ) {
                continue;
            }

            const parts = [];

            for (const resultGroup of resultGroups) {
                if (resultGroup === RESULT_GROUP_NONE) {
                    break;
                }

                if (resultGroup === RESULT_GROUP_ISSUE) {
                    if (!haveEpicInResultGroups) {
                        parts.push(row.extra.epicKey ? row.extra.epicKey : "-");
                        parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : "-");
                    }

                    parts.push(row.extra.issueKey);
                    parts.push(row.extra.issueTitle);
                } else if (resultGroup === RESULT_GROUP_QUEUE) {
                    parts.push(row.extra.queue);
                    parts.push(row.extra.queueName);
                } else if (resultGroup === RESULT_GROUP_WORKER) {
                    const user = usersMap[parseInt(row.extra.createdById)];

                    parts.push(row.extra.createdById);
                    parts.push(user.email);
                    parts.push(row.extra.createdByDisplay);
                } else if (resultGroup === RESULT_GROUP_EPIC) {
                    parts.push(row.extra.epicKey ? row.extra.epicKey : "-");
                    parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : "-");
                } else if (resultGroup === RESULT_GROUP_PROJECT) {
                    parts.push(row.extra.projectId ? row.extra.projectId : "-");
                    parts.push(row.extra.projectName ? row.extra.projectName : "-");
                } else if(resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                    parts.push(row.extra.issueTypeId ? row.extra.issueTypeId : "-");
                    parts.push(row.extra.issueTypeKey ? row.extra.issueTypeKey : "-");
                    parts.push(row.extra.issueTypeDisplay ? row.extra.issueTypeDisplay : "-");
                }
            }

            // Мы сдвигаем каждый раз и ставим элементы на свои позиции
            for (const date of dates) {
                const clone = JSON.parse(JSON.stringify(parts));

                const rawMinutes = extractRawMinutesFromDuration(rowDateExists(row, date) ? row.byDate[date.index].value : 0);

                if( rawMinutes === 0 ) {
                    continue;
                }

                clone.push(formatDate(date));
                clone.push(rawMinutes);

                csv.push(clone.join(";"));
            }
        }

        return csv;
    };

    const exportDataShort = () => {
        const header = [
            "Ключ типа", "Тип" // В заголовках AS IS всегда есть тип строки
        ];

        const haveEpicInResultGroups = resultGroups.includes(RESULT_GROUP_EPIC);

        for( const resultGroup of resultGroups ) {
            if( resultGroup === RESULT_GROUP_NONE ) {
                break;
            }

            if( resultGroup === RESULT_GROUP_ISSUE ) {
                if( !haveEpicInResultGroups ) {
                    header.push("Ключ эпика задачи");
                    header.push("Описание эпика задачи");
                }

                header.push("Ключ задачи");
                header.push("Описание задачи");
            } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                header.push("Ключ очереди");
                header.push("Описание очереди");
            } else if( resultGroup === RESULT_GROUP_WORKER ) {
                header.push("ФИО сотрудника");
            } else if( resultGroup === RESULT_GROUP_EPIC ) {
                header.push("Ключ эпика");
                header.push("Описание эпика");
            } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                header.push("ID проекта");
                header.push("Название проекта");
            } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                header.push("ID Типа задачи");
                header.push("Ключ типа задачи");
                header.push("Тип задачи");
            }
        }

        header.push("Итого");

        const csv = [
            header.join(";")
        ];

        for( const row of rows ) {
            const parts = [];

            // Тут сложность - надо понять что было ДО, и что будет ПОСЛЕ, что бы заполнить пустые места дефисами

            if( row.isSummary ) {
                parts.push("SUMMARY");
                parts.push("Итого");

                for( const resultGroup of resultGroups ) { // Тут всегда дефисы
                    if( resultGroup === RESULT_GROUP_NONE ) {
                        break;
                    }

                    if( resultGroup === RESULT_GROUP_ISSUE ) {
                        if( !haveEpicInResultGroups ) {
                            parts.push("-");
                            parts.push("-");
                        }

                        parts.push("-");
                        parts.push("-");
                    } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_WORKER ) {
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_EPIC ) {
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                        parts.push("-");
                        parts.push("-");
                    } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                        parts.push("-");
                        parts.push("-");
                        parts.push("-");
                    }
                }
            } else {
                const { resultGroup: currentResultGroup } = row.parameters;

                if( currentResultGroup === RESULT_GROUP_ISSUE ) {
                    continue;
                }

                parts.push(currentResultGroup);
                parts.push(RESULT_GROUPS_TRANSLATIONS[currentResultGroup]);

                // А тут мы заполняем ТОЛЬКО в том случае если у нас текущий resultGroup === resultGroup, в противном случае -

                for( const resultGroup of resultGroups ) {
                    if( resultGroup === RESULT_GROUP_NONE ) {
                        break;
                    }

                    if( resultGroup === RESULT_GROUP_ISSUE ) {
                        if( !haveEpicInResultGroups ) {
                            parts.push(row.extra.epicKey ? row.extra.epicKey : "-");
                            parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : "-");
                        }

                        parts.push(row.extra.issueKey);
                        parts.push(row.extra.issueTitle);
                    } else if ( resultGroup === RESULT_GROUP_QUEUE ) {
                        parts.push(currentResultGroup === resultGroup ? row.extra.queue : "-");
                        parts.push(currentResultGroup === resultGroup ? row.extra.queueName : "-");
                    } else if( resultGroup === RESULT_GROUP_WORKER ) {
                        parts.push(currentResultGroup === resultGroup ? row.extra.createdByDisplay : "-");
                    } else if( resultGroup === RESULT_GROUP_EPIC ) {
                        parts.push(row.extra.epicKey && currentResultGroup === resultGroup ? row.extra.epicKey : "-");
                        parts.push(row.extra.epicDisplay && currentResultGroup === resultGroup ? row.extra.epicDisplay : "-");
                    } else if( resultGroup === RESULT_GROUP_PROJECT ) {
                        parts.push(row.extra.projectId && currentResultGroup === resultGroup ? row.extra.projectId : "-");
                        parts.push(row.extra.projectName && currentResultGroup === resultGroup ? row.extra.projectName : "-");
                    } else if( resultGroup === RESULT_GROUP_ISSUE_TYPE ) {
                        parts.push(row.extra.issueTypeId && currentResultGroup === resultGroup ? row.extra.issueTypeId : "-");
                        parts.push(row.extra.issueTypeKe && currentResultGroup === resultGroup ? row.extra.issueTypeKey : "-");
                        parts.push(row.extra.issueTypeDisplay && currentResultGroup === resultGroup ? row.extra.issueTypeDisplay : "-");
                    }
                }
            }

            parts.push( extractRawMinutesFromDuration(row.value) );

            csv.push(parts.join(";"));
        }

        return csv;
    };

    const exportData = variant => {
        pushAnalytics("export", {variant});

        // По сути теперь ВСЁ что мы выводим - должно быть норм
        // Только в срочке с задачей - может быть дополнительно указан epic

        // Думаю что выгрузку стоит делать вложенную, со сдвигом ячеек

        // У нас будет 2 типа экспорта
        // Первый - съезжают заголовки -> каждый на своей строчке. В первой строчке будет тип строчки
        // Второй - в рамках последовательности будут одинаковые строчки

        const handlers = {
            [EXPORT_VARIANT_AS_IS]: exportDataAsIs,
            [EXPORT_VARIANT_ONE_ROW]: exportDataOneRow,
            [EXPORT_VARIANT_ONE_ROW_WITH_DATE]: exportDataOneRowWithDate,
            [EXPORT_VARIANT_SHORT]: exportDataShort
        };

        const csv = handlers[variant]();
        const bom = "\uFEFF";
        const encodedCsv = csv.map(row => encodeURIComponent(row.replace(/(\r\n|\n|\r)/gm, ""))).join("\n");

        const hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + bom + encodedCsv;
        hiddenElement.target = '_blank';

        hiddenElement.download = `export-time-sheet-${variant}.csv`;
        hiddenElement.click();

        setExportOpen(false);
    };

    return <Fragment>
        <Button
            fullWidth
            ref={anchorRef}
            color="success"
            variant="outlined"
            id="composition-button"
            aria-controls={exportOpen ? 'composition-menu' : undefined}
            aria-expanded={exportOpen ? 'true' : undefined}
            aria-haspopup="true"
            onClick={() => {
                setExportOpen(true);
                pushAnalytics("exportButtonClick");
            }}
        >
            {t('common:button.export')}
        </Button>
        <Popper
            open={exportOpen}
            anchorEl={anchorRef.current}
            sx={{zIndex: 99}}
            placement="bottom-start"
            transition
            disablePortal
        >
            {({TransitionProps, placement}) => (
                <Grow
                    {...TransitionProps}
                    style={{
                        transformOrigin:
                            placement === 'bottom-start' ? 'left top' : 'left bottom',
                    }}
                >
                    <Paper>
                        <ClickAwayListener onClickAway={() => setExportOpen(false)}>
                            <MenuList
                                autoFocusItem={exportOpen}
                                id="composition-menu"
                                aria-labelledby="composition-button"
                            >
                                {EXPORT_VARIANTS.map( variant => <MenuItem key={`export_variant-${variant}`} onClick={() => exportData(variant)}>
                                    {t(`export:variant.${variant}.label`)}
                                </MenuItem>)}
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>
    </Fragment>
}