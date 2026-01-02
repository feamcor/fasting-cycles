import type { Plan } from '../types';

export const DEFAULT_PLANS: Plan[] = [
    {
        id: 'hormonal-harmony',
        name: 'Hormonal Harmony',
        description: 'Aligns fasting intensity with your menstrual cycle hormones.',
        rules: [
            {
                dayStart: 1,
                dayEnd: 10,
                type: 'STANDARD',
                description: 'Follicular Phase: High resilience. Standard fasting allowed.'
            },
            {
                dayStart: 11,
                dayEnd: 15,
                type: 'LIMIT_HOURS',
                allowedHours: 15, // Max 15 hours fasting
                description: 'Ovulation: Limit fasting stress. Max 15 hours.'
            },
            {
                dayStart: 16,
                dayEnd: 19,
                type: 'STANDARD',
                description: 'Early Luteal: Resilience returns. Standard fasting allowed.'
            },
            {
                dayStart: 20,
                dayEnd: 'END',
                type: 'NO_FASTING',
                description: 'Late Luteal: Prepare for menstruation. No fasting recommended.'
            }
        ]
    }
];
