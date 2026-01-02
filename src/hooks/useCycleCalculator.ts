import { useMemo } from 'react';
import { differenceInCalendarDays, parseISO, startOfDay, addDays } from 'date-fns';
import { useSettingsStore } from '../store/useSettingsStore';
import { DEFAULT_PLANS } from '../data/defaultPlans';


export const useCycleCalculator = () => {
    const { lastPeriodStart, cycleLength, selectedPlanId } = useSettingsStore();

    const status = useMemo(() => {
        if (!lastPeriodStart) return null;

        const today = startOfDay(new Date());
        const startDate = startOfDay(parseISO(lastPeriodStart));

        // Calculate days passed since last period start
        const daysSinceStart = differenceInCalendarDays(today, startDate);

        // Calculate current cycle day (1-indexed)
        // If daysSinceStart is negative (future date), handle gracefully? Or assume past.
        // If daysSinceStart > cycleLength, we might be in a new cycle if the user forgot to log. 
        // For now, we'll just mod it to assume regularity or show "Late" - let's stick to simple Mod for projection.
        // Actually, "Day 1" is 0 days difference.

        let currentCycleDay = (daysSinceStart % cycleLength) + 1;
        if (currentCycleDay <= 0) currentCycleDay += cycleLength; // Handle negative diff if lastPeriodStart is future (which shouldn't happen but good to be safe)

        const plan = DEFAULT_PLANS.find(p => p.id === selectedPlanId) || DEFAULT_PLANS[0];

        const activeRule = plan.rules.find((rule) => {
            const start = rule.dayStart;
            const end = rule.dayEnd === 'END' ? cycleLength : rule.dayEnd;
            return currentCycleDay >= start && currentCycleDay <= end;
        });

        return {
            currentCycleDay,
            activeRule,
            planName: plan.name,
            daysSinceStart,
            nextPeriodEstimated: addDays(startDate, Math.floor(daysSinceStart / cycleLength) * cycleLength + cycleLength)
        };
    }, [lastPeriodStart, cycleLength, selectedPlanId]);

    return status;
};
