import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings } from '../types';

interface SettingsState extends UserSettings {
    setCycleLength: (length: number) => void;
    setPeriodLength: (length: number) => void;
    setLastPeriodStart: (date: string | null) => void;
    setSelectedPlanId: (id: string) => void;
    setFastingEnabled: (enabled: boolean) => void;

    // Custom Fasting Window for "STANDARD" type
    fastingWindowStart: string; // HH:mm, e.g., "20:00" (start fasting)
    fastingWindowEnd: string;   // HH:mm, e.g., "12:00" (end fasting / start eating)
    setFastingWindow: (start: string, end: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            cycleLength: 28,
            periodLength: 5,
            lastPeriodStart: null,
            selectedPlanId: 'hormonal-harmony',
            isFastingEnabled: true,

            fastingWindowStart: '20:00', // Start fasting at 8 PM
            fastingWindowEnd: '12:00',   // Eat at 12 PM (16:8 by default)

            setCycleLength: (cycleLength) => set({ cycleLength }),
            setPeriodLength: (periodLength) => set({ periodLength }),
            setLastPeriodStart: (lastPeriodStart) => set({ lastPeriodStart }),
            setSelectedPlanId: (selectedPlanId) => set({ selectedPlanId }),
            setFastingEnabled: (isFastingEnabled) => set({ isFastingEnabled }),
            setFastingWindow: (fastingWindowStart, fastingWindowEnd) => set({ fastingWindowStart, fastingWindowEnd }),
        }),
        {
            name: 'fasting-cycles-storage',
        }
    )
);
