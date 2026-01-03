import type { FastingTypeDef } from '../types';

export const BUILT_IN_FASTING_TYPES: FastingTypeDef[] = [
    {
        id: 'STANDARD',
        name: 'Standard (16:8)',
        windowDuration: 24,
        slots: [{ start: '0:20:00', end: '1:12:00', dayOffset: 1 }],
        isSystem: true,
        description: 'Fasting from 20:00 to 12:00 next day.'
    },
    {
        id: 'LIMIT_HOURS',
        name: 'Gentle Limit (12:12)',
        windowDuration: 24,
        slots: [{ start: '0:20:00', end: '1:08:00', dayOffset: 1 }],
        isSystem: true,
        description: 'Fasting from 20:00 to 08:00 next day.'
    },
    {
        id: 'NO_FASTING',
        name: 'No Fasting',
        windowDuration: 24,
        slots: [],
        isSystem: true,
        description: 'No scheduled fasting.'
    }
];
