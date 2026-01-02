export type FastingType = 'NO_FASTING' | 'LIMIT_HOURS' | 'STANDARD' | 'CUSTOM';

export interface FastingRule {
  dayStart: number;
  dayEnd: number | 'END';
  type: FastingType;
  allowedHours?: number; // e.g., 15 for 15-hour limit
  description?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  rules: FastingRule[];
}

export interface UserSettings {
  cycleLength: number; // Default 28
  periodLength: number; // Default 5
  lastPeriodStart: string | null; // ISO Date
  selectedPlanId: string;
  isFastingEnabled: boolean;
}
