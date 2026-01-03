import { useMemo } from 'react';
import { differenceInCalendarDays, parseISO, startOfDay, addDays } from 'date-fns';
import { useSettingsStore } from '../store/useSettingsStore';
import { DEFAULT_PLANS } from '../data/defaultPlans';


export const useCycleCalculator = () => {
    const { lastPeriodStart, cycleLength, selectedPlanId, customPlans } = useSettingsStore();

    const status = useMemo(() => {
        if (!lastPeriodStart) return null;

        const today = startOfDay(new Date());
        const startDate = startOfDay(parseISO(lastPeriodStart));

        // Calculate days passed since last period start
        const daysSinceStart = differenceInCalendarDays(today, startDate);

        // Calculate current cycle day (1-indexed)
        let currentCycleDay = (daysSinceStart % cycleLength) + 1;
        if (currentCycleDay <= 0) currentCycleDay += cycleLength;

        const allPlans = [...DEFAULT_PLANS, ...(customPlans || [])];
        const plan = allPlans.find(p => p.id === selectedPlanId) || DEFAULT_PLANS[0];

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
    }, [lastPeriodStart, cycleLength, selectedPlanId, customPlans]);

    return status;
};
