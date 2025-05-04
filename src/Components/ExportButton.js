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
    RESULT_GROUP_WORKER
} from "../constants";
import {useTranslation} from "react-i18next";
import {useAtomValue} from "jotai";
import {datesAtom, resultGroupsAtom, resultRowsAtom, usersMapAtom} from "../jotai/atoms";
import {useDateFormatter} from "../hooks";

export function ExportButton() {
    const {t} = useTranslation();

    const resultGroups = useAtomValue(resultGroupsAtom);
    const usersMap = useAtomValue(usersMapAtom);
    const rows = useAtomValue(resultRowsAtom);
    const dates = useAtomValue(datesAtom);

    const {formatDate} = useDateFormatter();

    const anchorRef = useRef(null);

    const [exportOpen, setExportOpen] = useState(false);

    const exportDataAsIs = () => {
        const header = [
            t('export:fields.issue_type_key.label'), t('export:fields.issue_type.label')
        ];

        const haveEpicInResultGroups = resultGroups.includes(RESULT_GROUP_EPIC);

        for (const resultGroup of resultGroups) {
            if (resultGroup === RESULT_GROUP_NONE) {
                break;
            }

            if (resultGroup === RESULT_GROUP_ISSUE) {
                if (!haveEpicInResultGroups) {
                    header.push(t('export:fields.issue_epic_key.label'));
                    header.push(t('export:fields.issue_epic_description.label'));
                }

                header.push(t('export:fields.issue_key.label'));
                header.push(t('export:fields.issue_description.label'));
            } else if (resultGroup === RESULT_GROUP_QUEUE) {
                header.push(t('export:fields.queue_key.label'));
                header.push(t('export:fields.queue_description.label'));
            } else if (resultGroup === RESULT_GROUP_WORKER) {
                header.push(t('export:fields.user_id.label'));
                header.push(t('export:fields.user_email.label'));
                header.push(t('export:fields.user_full_name.label'));
            } else if (resultGroup === RESULT_GROUP_EPIC) {
                header.push(t('export:fields.epic_key.label'));
                header.push(t('export:fields.epic_description.label'));
            } else if (resultGroup === RESULT_GROUP_PROJECT) {
                header.push(t('export:fields.project_id.label'));
                header.push(t('export:fields.project_name.label'));
            } else if (resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                header.push(t('export:fields.issue_type_id.label'));
                header.push(t('export:fields.issue_type_key.label'));
                header.push(t('export:fields.issue_type.label'));
            }
        }

        for (const date of dates) {
            header.push(formatDate(date));
        }

        header.push(t('common:total'));

        const csv = [
            header.join(";")
        ];

        for (const row of rows) {
            const parts = [];

            // Тут сложность - надо понять что было ДО, и что будет ПОСЛЕ, что бы заполнить пустые места дефисами

            if (row.isSummary) {
                parts.push(t('common:summary'));
                parts.push(t('common:total'));

                for (const resultGroup of resultGroups) { // Тут всегда дефисы
                    if (resultGroup === RESULT_GROUP_NONE) {
                        break;
                    }

                    if (resultGroup === RESULT_GROUP_ISSUE) {
                        if (!haveEpicInResultGroups) {
                            parts.push(t('common:no_data'));
                            parts.push(t('common:no_data'));
                        }

                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_QUEUE) {
                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_WORKER) {
                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_EPIC) {
                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_PROJECT) {
                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                    }
                }
            } else {
                const {resultGroup: currentResultGroup} = row.parameters;

                parts.push(currentResultGroup);
                parts.push(t(`filter:result_groups.values.${currentResultGroup}`));

                // А тут мы заполняем ТОЛЬКО в том случае если у нас текущий resultGroup === resultGroup, в противном случае -

                for (const resultGroup of resultGroups) {
                    if (resultGroup === RESULT_GROUP_NONE) {
                        break;
                    }

                    if (resultGroup === RESULT_GROUP_ISSUE) {
                        if (!haveEpicInResultGroups) {
                            parts.push(row.extra.epicKey && currentResultGroup === resultGroup ? row.extra.epicKey : t('common:no_data'));
                            parts.push(row.extra.epicDisplay && currentResultGroup === resultGroup ? row.extra.epicDisplay : t('common:no_data'));
                        }

                        parts.push(currentResultGroup === resultGroup ? row.extra.issueKey : t('common:no_data'));
                        parts.push(currentResultGroup === resultGroup ? row.extra.issueTitle : t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_QUEUE) {
                        parts.push(currentResultGroup === resultGroup ? row.extra.queue : t('common:no_data'));
                        parts.push(currentResultGroup === resultGroup ? row.extra.queueName : t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_WORKER) {
                        const user = usersMap[parseInt(row.extra.createdById)];

                        parts.push(currentResultGroup === resultGroup ? row.extra.createdById : t('common:no_data'));
                        parts.push(currentResultGroup === resultGroup ? user.email : t('common:no_data'));
                        parts.push(currentResultGroup === resultGroup ? row.extra.createdByDisplay : t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_EPIC) {
                        parts.push(row.extra.epicKey && currentResultGroup === resultGroup ? row.extra.epicKey : t('common:no_data'));
                        parts.push(row.extra.epicDisplay && currentResultGroup === resultGroup ? row.extra.epicDisplay : t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_PROJECT) {
                        parts.push(row.extra.projectId && currentResultGroup === resultGroup ? row.extra.projectId : t('common:no_data'));
                        parts.push(row.extra.projectName && currentResultGroup === resultGroup ? row.extra.projectName : t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                        parts.push(row.extra.issueTypeId && currentResultGroup === resultGroup ? row.extra.issueTypeId : t('common:no_data'));
                        parts.push(row.extra.issueTypeKey && currentResultGroup === resultGroup ? row.extra.issueTypeKey : t('common:no_data'));
                        parts.push(row.extra.issueTypeDisplay && currentResultGroup === resultGroup ? row.extra.issueTypeDisplay : t('common:no_data'));
                    }
                }
            }

            // Мы сдвигаем каждый раз и ставим элементы на свои позиции
            for (const date of dates) {
                parts.push(extractRawMinutesFromDuration(rowDateExists(row, date) ? row.byDate[date.index].value : 0));
            }

            parts.push(extractRawMinutesFromDuration(row.value));

            csv.push(parts.join(";"));
        }

        return csv;
    };

    const exportDataOneRow = () => {
        // В одну строчку ВСЁ очень просто
        // Мы перечисляем все resultGroups в начале
        const header = [];

        const haveEpicInResultGroups = resultGroups.includes(RESULT_GROUP_EPIC);

        for (const resultGroup of resultGroups) {
            if (resultGroup === RESULT_GROUP_NONE) {
                break;
            }

            if (resultGroup === RESULT_GROUP_ISSUE) {
                if (!haveEpicInResultGroups) {
                    header.push(t('export:fields.issue_epic_key.label'));
                    header.push(t('export:fields.issue_epic_description.label'));
                }

                header.push(t('export:fields.issue_key.label'));
                header.push(t('export:fields.issue_description.label'));
            } else if (resultGroup === RESULT_GROUP_QUEUE) {
                header.push(t('export:fields.queue_key.label'));
                header.push(t('export:fields.queue_description.label'));
            } else if (resultGroup === RESULT_GROUP_WORKER) {
                header.push(t('export:fields.user_id.label'));
                header.push(t('export:fields.user_email.label'));
                header.push(t('export:fields.user_full_name.label'));
            } else if (resultGroup === RESULT_GROUP_EPIC) {
                header.push(t('export:fields.epic_key.label'));
                header.push(t('export:fields.epic_description.label'));
            } else if (resultGroup === RESULT_GROUP_PROJECT) {
                header.push(t('export:fields.project_id.label'));
                header.push(t('export:fields.project_name.label'));
            } else if (resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                header.push(t('export:fields.issue_type_id.label'));
                header.push(t('export:fields.issue_type_key.label'));
                header.push(t('export:fields.issue_type.label'));
            }
        }

        for (const date of dates) {
            header.push(formatDate(date));
        }

        header.push(t('common:total'));

        const csv = [
            header.join(";")
        ];

        for (const row of rows) {
            if (!row.isMaxDepth && !row.isSummary) {
                continue;
            }

            const parts = [];

            if (row.isSummary) {
                parts.push(t('common:total'));

                let offset = 0;

                for (const resultGroup of resultGroups) {
                    if (resultGroup === RESULT_GROUP_NONE) {
                        break;
                    }

                    if (resultGroup === RESULT_GROUP_ISSUE) {
                        if (!haveEpicInResultGroups) {
                            offset += 2;
                        }

                        offset += 2;
                    } else if (resultGroup === RESULT_GROUP_QUEUE) {
                        offset += 2;
                    } else if (resultGroup === RESULT_GROUP_WORKER) {
                        offset += 3;
                    } else if (resultGroup === RESULT_GROUP_EPIC) {
                        offset += 2;
                    } else if (resultGroup === RESULT_GROUP_PROJECT) {
                        offset += 2;
                    } else if (resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                        offset += 3;
                    }
                }

                offset--; // За строчку Итого

                while (offset > 0) {
                    offset--;

                    parts.push(t('common:no_data'));
                }
            } else {
                for (const resultGroup of resultGroups) {
                    if (resultGroup === RESULT_GROUP_NONE) {
                        break;
                    }

                    if (resultGroup === RESULT_GROUP_ISSUE) {
                        if (!haveEpicInResultGroups) {
                            parts.push(row.extra.epicKey ? row.extra.epicKey : t('common:no_data'));
                            parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : t('common:no_data'));
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
                        parts.push(row.extra.epicKey ? row.extra.epicKey : t('common:no_data'));
                        parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_PROJECT) {
                        parts.push(row.extra.projectId ? row.extra.projectId : t('common:no_data'));
                        parts.push(row.extra.projectName ? row.extra.projectName : t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                        parts.push(row.extra.issueTypeId ? row.extra.issueTypeId : t('common:no_data'));
                        parts.push(row.extra.issueTypeKey ? row.extra.issueTypeKey : t('common:no_data'));
                        parts.push(row.extra.issueTypeDisplay ? row.extra.issueTypeDisplay : t('common:no_data'));
                    }
                }
            }

            // Мы сдвигаем каждый раз и ставим элементы на свои позиции
            for (const date of dates) {
                parts.push(extractRawMinutesFromDuration(rowDateExists(row, date) ? row.byDate[date.index].value : 0));
            }

            parts.push(extractRawMinutesFromDuration(row.value));

            csv.push(parts.join(";"));
        }

        return csv;
    };

    const exportDataOneRowWithDate = () => {
        // В одну строчку ВСЁ очень просто
        // Мы перечисляем все resultGroups в начале
        const header = [];

        const haveEpicInResultGroups = resultGroups.includes(RESULT_GROUP_EPIC);

        for (const resultGroup of resultGroups) {
            if (resultGroup === RESULT_GROUP_NONE) {
                break;
            }

            if (resultGroup === RESULT_GROUP_ISSUE) {
                if (!haveEpicInResultGroups) {
                    header.push(t('export:fields.issue_epic_key.label'));
                    header.push(t('export:fields.issue_epic_description.label'));
                }

                header.push(t('export:fields.issue_key.label'));
                header.push(t('export:fields.issue_description.label'));
            } else if (resultGroup === RESULT_GROUP_QUEUE) {
                header.push(t('export:fields.queue_key.label'));
                header.push(t('export:fields.queue_description.label'));
            } else if (resultGroup === RESULT_GROUP_WORKER) {
                header.push(t('export:fields.user_id.label'));
                header.push(t('export:fields.user_email.label'));
                header.push(t('export:fields.user_full_name.label'));
            } else if (resultGroup === RESULT_GROUP_EPIC) {
                header.push(t('export:fields.epic_key.label'));
                header.push(t('export:fields.epic_description.label'));
            } else if (resultGroup === RESULT_GROUP_PROJECT) {
                header.push(t('export:fields.project_id.label'));
                header.push(t('export:fields.project_name.label'));
            } else if (resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                header.push(t('export:fields.issue_type_id.label'));
                header.push(t('export:fields.issue_type_key.label'));
                header.push(t('export:fields.issue_type.label'));
            }
        }

        header.push(t('export:fields.date.label'));
        header.push(t('export:fields.value.label'));

        const csv = [
            header.join(";")
        ];

        for (const row of rows) {
            if (!row.isMaxDepth || row.isSummary) {
                continue;
            }

            const parts = [];

            for (const resultGroup of resultGroups) {
                if (resultGroup === RESULT_GROUP_NONE) {
                    break;
                }

                if (resultGroup === RESULT_GROUP_ISSUE) {
                    if (!haveEpicInResultGroups) {
                        parts.push(row.extra.epicKey ? row.extra.epicKey : t('common:no_data'));
                        parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : t('common:no_data'));
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
                    parts.push(row.extra.epicKey ? row.extra.epicKey : t('common:no_data'));
                    parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : t('common:no_data'));
                } else if (resultGroup === RESULT_GROUP_PROJECT) {
                    parts.push(row.extra.projectId ? row.extra.projectId : t('common:no_data'));
                    parts.push(row.extra.projectName ? row.extra.projectName : t('common:no_data'));
                } else if (resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                    parts.push(row.extra.issueTypeId ? row.extra.issueTypeId : t('common:no_data'));
                    parts.push(row.extra.issueTypeKey ? row.extra.issueTypeKey : t('common:no_data'));
                    parts.push(row.extra.issueTypeDisplay ? row.extra.issueTypeDisplay : t('common:no_data'));
                }
            }

            // Мы сдвигаем каждый раз и ставим элементы на свои позиции
            for (const date of dates) {
                const clone = JSON.parse(JSON.stringify(parts));

                const rawMinutes = extractRawMinutesFromDuration(rowDateExists(row, date) ? row.byDate[date.index].value : 0);

                if (rawMinutes === 0) {
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
            t('export:fields.issue_type_key.label'), t('export:fields.issue_type.label')
        ];

        const haveEpicInResultGroups = resultGroups.includes(RESULT_GROUP_EPIC);

        for (const resultGroup of resultGroups) {
            if (resultGroup === RESULT_GROUP_NONE) {
                break;
            }

            if (resultGroup === RESULT_GROUP_ISSUE) {
                if (!haveEpicInResultGroups) {
                    header.push(t('export:fields.issue_epic_key.label'));
                    header.push(t('export:fields.issue_epic_description.label'));
                }

                header.push(t('export:fields.issue_key.label'));
                header.push(t('export:fields.issue_description.label'));
            } else if (resultGroup === RESULT_GROUP_QUEUE) {
                header.push(t('export:fields.queue_key.label'));
                header.push(t('export:fields.queue_description.label'));
            } else if (resultGroup === RESULT_GROUP_WORKER) {
                header.push(t('export:fields.user_full_name.label'));
            } else if (resultGroup === RESULT_GROUP_EPIC) {
                header.push(t('export:fields.epic_key.label'));
                header.push(t('export:fields.epic_description.label'));
            } else if (resultGroup === RESULT_GROUP_PROJECT) {
                header.push(t('export:fields.project_id.label'));
                header.push(t('export:fields.project_name.label'));
            } else if (resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                header.push(t('export:fields.issue_type_id.label'));
                header.push(t('export:fields.issue_type_key.label'));
                header.push(t('export:fields.issue_type.label'));
            }
        }

        header.push(t('common:total'));

        const csv = [
            header.join(";")
        ];

        for (const row of rows) {
            const parts = [];

            // Тут сложность - надо понять что было ДО, и что будет ПОСЛЕ, что бы заполнить пустые места дефисами

            if (row.isSummary) {
                parts.push(t('common:summary'));
                parts.push(t('common:total'));

                for (const resultGroup of resultGroups) { // Тут всегда дефисы
                    if (resultGroup === RESULT_GROUP_NONE) {
                        break;
                    }

                    if (resultGroup === RESULT_GROUP_ISSUE) {
                        if (!haveEpicInResultGroups) {
                            parts.push(t('common:no_data'));
                            parts.push(t('common:no_data'));
                        }

                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_QUEUE) {
                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_WORKER) {
                        parts.push(t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_EPIC) {
                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_PROJECT) {
                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                        parts.push(t('common:no_data'));
                    }
                }
            } else {
                const {resultGroup: currentResultGroup} = row.parameters;

                if (currentResultGroup === RESULT_GROUP_ISSUE) {
                    continue;
                }

                parts.push(currentResultGroup);
                parts.push(t(`filter:result_groups.values.${currentResultGroup}`));

                // А тут мы заполняем ТОЛЬКО в том случае если у нас текущий resultGroup === resultGroup, в противном случае -

                for (const resultGroup of resultGroups) {
                    if (resultGroup === RESULT_GROUP_NONE) {
                        break;
                    }

                    if (resultGroup === RESULT_GROUP_ISSUE) {
                        if (!haveEpicInResultGroups) {
                            parts.push(row.extra.epicKey ? row.extra.epicKey : t('common:no_data'));
                            parts.push(row.extra.epicDisplay ? row.extra.epicDisplay : t('common:no_data'));
                        }

                        parts.push(row.extra.issueKey);
                        parts.push(row.extra.issueTitle);
                    } else if (resultGroup === RESULT_GROUP_QUEUE) {
                        parts.push(currentResultGroup === resultGroup ? row.extra.queue : t('common:no_data'));
                        parts.push(currentResultGroup === resultGroup ? row.extra.queueName : t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_WORKER) {
                        parts.push(currentResultGroup === resultGroup ? row.extra.createdByDisplay : t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_EPIC) {
                        parts.push(row.extra.epicKey && currentResultGroup === resultGroup ? row.extra.epicKey : t('common:no_data'));
                        parts.push(row.extra.epicDisplay && currentResultGroup === resultGroup ? row.extra.epicDisplay : t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_PROJECT) {
                        parts.push(row.extra.projectId && currentResultGroup === resultGroup ? row.extra.projectId : t('common:no_data'));
                        parts.push(row.extra.projectName && currentResultGroup === resultGroup ? row.extra.projectName : t('common:no_data'));
                    } else if (resultGroup === RESULT_GROUP_ISSUE_TYPE) {
                        parts.push(row.extra.issueTypeId && currentResultGroup === resultGroup ? row.extra.issueTypeId : t('common:no_data'));
                        parts.push(row.extra.issueTypeKe && currentResultGroup === resultGroup ? row.extra.issueTypeKey : t('common:no_data'));
                        parts.push(row.extra.issueTypeDisplay && currentResultGroup === resultGroup ? row.extra.issueTypeDisplay : t('common:no_data'));
                    }
                }
            }

            parts.push(extractRawMinutesFromDuration(row.value));

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
                                {EXPORT_VARIANTS.map(variant => <MenuItem key={`export_variant-${variant}`}
                                                                          onClick={() => exportData(variant)}>
                                    {t(`export:variants.${variant}.label`)}
                                </MenuItem>)}
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>
    </Fragment>
}