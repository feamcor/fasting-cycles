// Defines the configuration for a fasting type (e.g., 16:8, 20:4)
// Defines the configuration for a fasting type
export interface FastingSlot {
  start: string; // HH:mm relative to window start (e.g., "20:00")
  end: string;   // HH:mm relative to window start
  dayOffset: number; // 0 for same day, 1 for next day (relative to window start)
}

export interface FastingTypeDef {
  id: string; // 'STANDARD', 'NO_FASTING' or custom UUID
  name: string;
  windowDuration: number; // Hours (e.g., 24, 48)
  slots: FastingSlot[];   // Fasting periods
  color: string;
  description?: string;
  isSystem?: boolean;
}

export type FastingType = 'NO_FASTING' | 'LIMIT_HOURS' | 'STANDARD' | string; // Allow custom IDs

export interface FastingRule {
  dayStart: number;
  dayEnd: number | 'END';
  type: FastingType;
  description?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  rules: FastingRule[];
}

export interface CycleEntry {
  startDate: string; // ISO Date
  endDate?: string;  // ISO Date (optional, if not yet ended)
  planSnapshot?: {
    id: string;
    name: string;
  };
}

export interface UserSettings {
  cycleLength: number; // Default 28
  periodLength: number; // Default 5
  lastPeriodStart: string | null; // Keep for backward compat
  cycleHistory: CycleEntry[]; // Array of CycleEntry objects
  selectedPlanId: string;
  isFastingEnabled: boolean;
  customPlans: Plan[];
  customFastingTypes: FastingTypeDef[]; // User-defined fasting types
}
