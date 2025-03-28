import * as React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid2";
import Dialog from "@mui/material/Dialog";

function ChangelogDialog({ state, handleClose }) {
    return <Dialog open={state} onClose={() => handleClose()} fullWidth maxWidth="lg">
        <DialogTitle>История изменений</DialogTitle>
        <DialogContent>
            <Grid container spacing={2} sx={{paddingTop: 2}}>
                <Grid size={{xs: 12}}><Timeline>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            02.07.2024
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Добавлена опция загрузки задач и времени по переходу в определённые статусы в конкретном месяце<br />
                            2. Добавлен эксперементальный формат вывода "Деньги"<br />
                            3. Исправлена ошибка, из-за которой при повторном изменении группировки могли возникать непредвиденные результаты.<br />
                            4. Исправлена ошибка, из-за которой в некоторых случаях CSV выгружался криво<br />
                            5. Исправлена ошибка, из-за который в некоторых случаях невозможно было отметить время в задачу
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            03.04.2024
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Исправлена ошибка, из-за которой в диалоговом окне удаления рабочего времени появлялся текст "undefined"
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            06.02.2024
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Исправлена ошибка, из-за которой название очереди иногда не отображалось
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            21.11.2023
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Добавлена возможность фильтровать задачи по типу<br />
                            2. Исправлена ошибка, из-за которой переключатель времени иногда не оказывал влияния на результирующую таблицу
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            20.11.2023
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. В списке групп теперь отображается количество участников группы<br />
                            2. Исправлена ошибка, из-за которой в диалоговом окне создания отметки времени не появлялись часы выбора времени
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            31.10.2023
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Теперь отчёт можно загрузить за любой промежуток дат, если он очень большой то будет загружаться по частям<br />
                            2. При выгрузке большого промежутка времени добавлена возможность сгруппировать его по месяцам и скрыть детали (для ускорения загрузки)<br />
                            3. Добавлено прилипание колонки с заголовками (самая левая), теперь при скроле вправо она всегда отображается<br />
                            4. Добавлено прилипание строки с заголовками, теперь при скроле вниз она всегда отображается<br />
                            5. Добавлена виртуалзиация таблицы при выгрузке большого числа строк (теперь их не найти через Ctrl+F, но браузер не виснет, и доскролить до них всё ещё можно)<br />
                            6. Добавлены группировка, графики и экспорт по типу задач
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            27.10.2023
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Исправлена ошибка, из-за которой выпадающее меню экспорта
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            24.10.2023
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Добавлена возможность указывать группировки в разном порядке
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            11.10.2023
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Добавлена информация об эпике, к которому относится задача
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            10.10.2023
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Добавлена функция подсветки времени, в случае если оно меньше требуемого при группировке по автору отметки времени
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            02.10.2023
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Для публичной версии (yt-time-sheets.ru) добавлена google analytics
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            02.10.2023
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Для публичной версии (yt-time-sheets.ru) добавлена google analytics
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            21.04.2023
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Продукт добавлен в Yandex Cloud Marketplace
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            29.10.2022
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Добавлен поиск задачи по проекту<br />
                            2. Добавлена группировка по очереди и проекту
                        </TimelineContent>
                    </TimelineItem>
                    <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                            28.10.2022
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot/>
                            <TimelineConnector/>
                        </TimelineSeparator>
                        <TimelineContent>
                            1. Первый релиз проекта
                        </TimelineContent>
                    </TimelineItem>
                </Timeline>
                </Grid></Grid></DialogContent></Dialog>
}

export default ChangelogDialog;