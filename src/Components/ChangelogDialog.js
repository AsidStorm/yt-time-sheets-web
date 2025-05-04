import React from 'react';
import {Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent} from '@mui/lab';
import {DialogTitle, DialogContent, Grid, Dialog} from "@mui/material";
import {
    timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import {useTranslation} from "react-i18next";
import moment from "moment";
import {useChangelogDialog, useDateFormatter} from "../hooks";


function ChangelogDialog() {
    const {t} = useTranslation();

    const {isOpen, close} = useChangelogDialog();

    const {formatDateExact} = useDateFormatter();

    const changelog = [
        {
            date: moment('03.05.2025', 'DD.MM.YYYY'),
            key: '04_05_2025',
            list: [
                "04_05_2025_001",
                "04_05_2025_002",
                "04_05_2025_003",
                "04_05_2025_004",
                "04_05_2025_005",
                "04_05_2025_006",
                "04_05_2025_007",
                "04_05_2025_008",
                "04_05_2025_009",
                "04_05_2025_010",
            ]
        },
        {
            date: moment('28.03.2025', 'DD.MM.YYYY'),
            key: '28_03_2025',
            list: [
                "28_03_2025_001"
            ]
        },
        {
            date: moment('30.11.2024', 'DD.MM.YYYY'),
            key: '30_11_2024',
            list: [
                "30_11_2024_001"
            ]
        },
        {
            date: moment('02.07.2024', 'DD.MM.YYYY'),
            key: '02_07_2024',
            list: [
                "02_07_2024_001",
                "02_07_2024_002",
                "02_07_2024_003",
                "02_07_2024_004",
                "02_07_2024_005"
            ]
        },
        {
            date: moment('03.04.2024', 'DD.MM.YYYY'),
            key: '03_04_2024',
            list: [
                "03_04_2024_001"
            ]
        },
        {
            date: moment('06.02.2024', 'DD.MM.YYYY'),
            key: '06_02_2024',
            list: [
                "06_02_2024_001",
            ]
        },
        {
            date: moment('21.11.2023', 'DD.MM.YYYY'),
            key: '21_11_2023',
            list: [
                "21_11_2023_001",
                "21_11_2023_002"
            ]
        },
        {
            date: moment('20.11.2023', 'DD.MM.YYYY'),
            key: '20_11_2023',
            list: [
                "20_11_2023_001",
                "20_11_2023_002"
            ]
        },
        {
            date: moment('31.10.2023', 'DD.MM.YYYY'),
            key: '31_10_2023',
            list: [
                "31_10_2023_001",
                "31_10_2023_002",
                "31_10_2023_003",
                "31_10_2023_004",
                "31_10_2023_005",
                "31_10_2023_006"
            ]
        },
        {
            date: moment('27.10.2023', 'DD.MM.YYYY'),
            key: '27_10_2023',
            list: [
                "27_10_2023_001"
            ]
        },
        {
            date: moment('24.10.2023', 'DD.MM.YYYY'),
            key: '24_10_2023',
            list: [
                "24_10_2023_001"
            ]
        },
        {
            date: moment('11.10.2023', 'DD.MM.YYYY'),
            key: '11_10_2023',
            list: [
                "11_10_2023_001"
            ]
        },
        {
            date: moment('10.10.2023', 'DD.MM.YYYY'),
            key: '10_10_2023',
            list: [
                "10_10_2023_001"
            ]
        },
        {
            date: moment('02.10.2023', 'DD.MM.YYYY'),
            key: '02_10_2023',
            list: [
                "02_10_2023_001"
            ]
        },
        {
            date: moment('21.04.2023', 'DD.MM.YYYY'),
            key: '21_04_2023',
            list: [
                "21_04_2023_001"
            ]
        },
        {
            date: moment('29.10.2022', 'DD.MM.YYYY'),
            key: '29_10_2022',
            list: [
                "29_10_2022_001",
                "29_10_2022_002"
            ]
        },
        {
            date: moment('28.10.2022', 'DD.MM.YYYY'),
            key: '28_10_2022',
            list: [
                "28_10_2022_001"
            ]
        },
    ];

    return <Dialog open={isOpen} onClose={close} fullWidth maxWidth="lg">
        <DialogTitle>{t('changelog:title')}</DialogTitle>
        <DialogContent>
            <Grid container spacing={2} sx={{paddingTop: 2}}>
                <Grid size={{xs: 12}}>
                    <Timeline sx={{
                        [`& .${timelineOppositeContentClasses.root}`]: {
                            flex: 0.2,
                        },
                    }}>
                        {changelog.map((value, index) => <TimelineItem key={value.key}>
                            <TimelineOppositeContent color="text.secondary">
                                {formatDateExact(value.date)}
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineDot/>
                                {index + 1 !== changelog.length && <TimelineConnector/>}
                            </TimelineSeparator>
                            <TimelineContent>
                                <ul>
                                    {value.list.map(item => <li key={item}>{t(`changelog:${item}`)}</li>)}
                                </ul>
                            </TimelineContent>
                        </TimelineItem>)}
                    </Timeline>
                </Grid>
            </Grid>
        </DialogContent>
    </Dialog>
}

export default ChangelogDialog;