// Defines the configuration for a fasting type (e.g., 16:8, 20:4)
export interface FastingTypeDef {
  id: string; // 'STANDARD', 'NO_FASTING' or custom UUID
  name: string;
  fastingHours: number;
  eatingHours: number;
  description?: string;
  isSystem?: boolean; // Pre-defined types that can't be deleted
}

export type FastingType = 'NO_FASTING' | 'LIMIT_HOURS' | 'STANDARD' | string; // Allow custom IDs

export interface FastingRule {
  dayStart: number;
  dayEnd: number | 'END';
  type: FastingType;
  allowedHours?: number; // e.g., 15 for 15-hour limit (Specific to LIMIT_HOURS type essentially)
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
