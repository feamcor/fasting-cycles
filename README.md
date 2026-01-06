# ![Fasting Cycles Logo](public/logo.png) Fasting Cycles

**Fasting Cycles** is a progressive web application (PWA) designed to help users synchronize their intermittent fasting practice with their menstrual cycle. By adapting fasting windows and intensity based on hormonal phases, the app aims to support metabolic health without disrupting hormonal balance.

## Features

- **Cycle Tracking**: Log periods and track current cycle phase (Menstrual, Follicular, Ovulatory, Luteal).
- **Smart Fasting Guidance**: Receive daily fasting recommendations adapted to your specific cycle day.
- **Flexible Plans**:
  - **Hormonal Harmony (Default)**: Optimized for cycle synchronization.
  - **Gentle Start**: For beginners.
  - **Custom Plans**: Create your own rules and schedules.
- **Interactive Dashboard**: View today's status, fasting timer (if applicable), and "Reality Check" phase descriptions.
- **Calendar View**: Visual overview of past cycles and future predictions with fasting indicators.
- **Data Privacy**: All data is stored locally on your device.
- **Import/Export**: Backup your data to JSON or transfer it between devices.

## Technical Overview

### Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Vanilla CSS (CSS Variables)
- **Date Handling**: date-fns
- **PWA**: vite-plugin-pwa

### Data Persistence

The application uses **local storage** for data persistence, implemented via Zustand's `persist` middleware.
- **Storage Key**: `fasting-cycles-storage`
- **Data Privacy**: No data is sent to any external server. Everything resides in the user's browser.

### Project Structure

```
src/
├── components/   # React components (Dashboard, Calendar, etc.)
├── data/         # Static data (default plans)
├── hooks/        # Custom React hooks
├── i18n/         # Internationalization dictionary
├── store/        # Zustand store (state & logic)
├── styles/       # Global CSS and variables
├── types/        # TypeScript interfaces
└── utils/        # Helper functions
```

### Data Schema (Import/Export)

The export file is a JSON representation of the `UserSettings` interface.

```typescript
interface UserSettings {
  cycleLength: number;         // Average length of cycle in days
  periodLength: number;        // Average length of period in days
  lastPeriodStart: string;     // ISO Date (YYYY-MM-DD)
  
  // Historical Data
  cycleHistory: {
    startDate: string;         // ISO Date
    endDate?: string;          // ISO Date
    planSnapshot?: {           // Plan active during this cycle
      id: string;
      name: string;
    };
  }[];

  // Configuration
  selectedPlanId: string;      // ID of the active plan
  isFastingEnabled: boolean;   // Master toggle for fasting features
  language: 'en_US' | 'pt_BR';

  // Custom Data
  customPlans: Plan[];         // User-created plans
  customFastingTypes: FastingTypeDef[]; // User-defined fasting windows (e.g., 16:8)
}
```
