import { addDays, subMonths, format } from 'date-fns';
import type { CycleEntry } from '../types';
import { DEFAULT_PLANS } from '../data/defaultPlans';

export const generateMockHistory = (): CycleEntry[] => {
    const history: CycleEntry[] = [];
    const today = new Date();
    // Start approx 12 months ago
    let currentDate = subMonths(today, 12);

    // Align to a "start" date nearby
    currentDate.setDate(1);

    while (currentDate < today) {
        // Cycle Length variation: 26-30 days
        const cycleLength = 26 + Math.floor(Math.random() * 5);
        // Period Length variation: 4-6 days
        const periodLength = 4 + Math.floor(Math.random() * 3);

        const startDate = format(currentDate, 'yyyy-MM-dd');
        const endDateDate = addDays(currentDate, periodLength - 1);
        const endDate = format(endDateDate, 'yyyy-MM-dd');

        // Pick a plan snapshot
        // Alternate between Hormone Harmony and a fake Custom one
        const useDefault = Math.random() > 0.3;
        const planSnapshot = useDefault
            ? { id: DEFAULT_PLANS[0].id, name: DEFAULT_PLANS[0].name }
            : { id: 'custom-1', name: 'Summer Cut (Custom)' };

        if (endDateDate < today) {
            history.push({
                startDate,
                endDate,
                planSnapshot
            });
        } else {
            // Current active cycle
            history.push({
                startDate,
                // Maybe it hasn't ended? or maybe it just ended. Let's make it ongoing if very recent.
                // But for simplicity, let's just complete them all up to today.
                endDate: endDateDate > today ? undefined : endDate,
                planSnapshot
            });
        }

        // Advance to next cycle
        currentDate = addDays(currentDate, cycleLength);
    }

    // Sort descending (newest first) as expected by the store
    return history.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
};
