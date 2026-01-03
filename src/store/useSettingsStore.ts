import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings, CycleEntry, Plan, FastingTypeDef } from '../types';

import { differenceInCalendarDays, parseISO } from 'date-fns';

interface SettingsState extends UserSettings {
    setCycleLength: (length: number) => void;
    setPeriodLength: (length: number) => void;
    setLastPeriodStart: (date: string | null) => void;
    logPeriod: (date: string) => void; // Deprecated, alias to logPeriodStart
    logPeriodStart: (date: string) => void;
    logPeriodEnd: (date: string) => void;
    setSelectedPlanId: (id: string) => void;
    setFastingEnabled: (enabled: boolean) => void;

    // Custom Fasting Window for "STANDARD" type
    fastingWindowStart: string; // HH:mm, e.g., "20:00" (start fasting)
    fastingWindowEnd: string;   // HH:mm, e.g., "12:00" (end fasting / start eating)
    setFastingWindow: (start: string, end: string) => void;

    // Plan Management
    addPlan: (plan: Plan) => void;
    updatePlan: (plan: Plan) => void;
    deletePlan: (id: string) => void;

    // Fasting Type Management
    addFastingType: (type: FastingTypeDef) => void;
    deleteFastingType: (id: string) => void;
    customFastingTypes: FastingTypeDef[]; // Initialize in state
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            cycleLength: 28,
            periodLength: 5,
            lastPeriodStart: null,
            cycleHistory: [],
            selectedPlanId: 'hormonal-harmony',
            isFastingEnabled: true,
            customPlans: [],
            customFastingTypes: [], // Initial state

            fastingWindowStart: '20:00', // Start fasting at 8 PM
            fastingWindowEnd: '12:00',   // Eat at 12 PM (16:8 by default)

            setCycleLength: (cycleLength) => set({ cycleLength }),
            setPeriodLength: (periodLength) => set({ periodLength }),

            // Legacy setter acting as a reset/initial set
            setLastPeriodStart: (lastPeriodStart) => set(() => {
                // Reset history if using this setter manually
                if (!lastPeriodStart) return { lastPeriodStart, cycleHistory: [] };
                const newEntry: CycleEntry = { startDate: lastPeriodStart };
                return {
                    lastPeriodStart,
                    cycleHistory: [newEntry]
                };
            }),

            logPeriod: (date) => get().logPeriodStart(date), // Alias for backward compat if needed, or remove

            logPeriodStart: (date) => {
                const state = get();
                const today = new Date();
                if (new Date(date) > today) {
                    alert("Cannot log future dates.");
                    return;
                }

                const newEntry: CycleEntry = { startDate: date };
                // Add to history, dedupe by startDate
                const newHistory = [newEntry, ...state.cycleHistory]
                    .filter((entry, i, self) => self.findIndex(e => e.startDate === entry.startDate) === i)
                    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                    .slice(0, 24);

                // Recalculate Cycle Length
                let newCycleLength = state.cycleLength;
                if (newHistory.length >= 2) {
                    let totalDays = 0;
                    let gaps = 0;
                    for (let i = 0; i < newHistory.length - 1; i++) {
                        const current = parseISO(newHistory[i].startDate);
                        const prev = parseISO(newHistory[i + 1].startDate);
                        const diff = differenceInCalendarDays(current, prev);
                        if (diff > 15 && diff < 60) {
                            totalDays += diff;
                            gaps++;
                        }
                    }
                    if (gaps > 0) newCycleLength = Math.round(totalDays / gaps);
                }

                set({
                    cycleHistory: newHistory,
                    lastPeriodStart: newHistory[0].startDate,
                    cycleLength: newCycleLength
                });
            },

            logPeriodEnd: (date) => {
                const state = get();
                const today = new Date();
                if (new Date(date) > today) {
                    alert("Cannot log future dates.");
                    return;
                }

                // Attach end date to the most recent cycle start that is BEFORE this end date
                // For simplicity, we usually update the latest cycle if it makes sense
                const history = [...state.cycleHistory];
                const targetEntryIndex = history.findIndex(entry => new Date(entry.startDate) <= new Date(date));

                if (targetEntryIndex === -1) {
                    alert("No matching period start found for this end date.");
                    return;
                }

                // Update entry
                history[targetEntryIndex] = { ...history[targetEntryIndex], endDate: date };

                // Recalculate Average Period Length
                let newPeriodLength = state.periodLength;
                let totalDuration = 0;
                let count = 0;

                history.forEach(entry => {
                    if (entry.endDate) {
                        const start = parseISO(entry.startDate);
                        const end = parseISO(entry.endDate);
                        const duration = differenceInCalendarDays(end, start) + 1; // Inclusive
                        if (duration > 1 && duration < 15) { // Filter outliers
                            totalDuration += duration;
                            count++;
                        }
                    }
                });

                if (count > 0) {
                    newPeriodLength = Math.round(totalDuration / count);
                }

                set({
                    cycleHistory: history,
                    periodLength: newPeriodLength
                });
            },

            setSelectedPlanId: (selectedPlanId) => set({ selectedPlanId }),
            setFastingEnabled: (isFastingEnabled) => set({ isFastingEnabled }),
            setFastingWindow: (fastingWindowStart, fastingWindowEnd) => set({ fastingWindowStart, fastingWindowEnd }),

            addPlan: (plan: Plan) => set((state) => ({
                customPlans: [...(state.customPlans || []), plan],
                selectedPlanId: plan.id // Auto-select new plan? Sure.
            })),

            updatePlan: (updatedPlan: Plan) => set((state) => ({
                customPlans: (state.customPlans || []).map(p => p.id === updatedPlan.id ? updatedPlan : p)
            })),

            deletePlan: (id: string) => set((state) => {
                const newPlans = (state.customPlans || []).filter(p => p.id !== id);
                return {
                    customPlans: newPlans,
                    selectedPlanId: state.selectedPlanId === id ? 'hormonal-harmony' : state.selectedPlanId
                };
            }),

            addFastingType: (type) => set((state) => ({
                customFastingTypes: [...(state.customFastingTypes || []), type]
            })),

            deleteFastingType: (id) => set((state) => ({
                customFastingTypes: (state.customFastingTypes || []).filter(t => t.id !== id)
            })),
        }),
        {
            name: 'fasting-cycles-storage',
        }
    )
);
