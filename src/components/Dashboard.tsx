import { useState } from 'react';
import { useCycleCalculator } from '../hooks/useCycleCalculator';
import { useSettingsStore } from '../store/useSettingsStore';
import { BUILT_IN_FASTING_TYPES } from '../data/fastingTypes';
import Calendar from './Calendar';


const Dashboard = () => {
    const status = useCycleCalculator();
    const {
        cycleHistory,
        customFastingTypes
    } = useSettingsStore();

    // State for Reality Check Date Selection
    const [loggingMode, setLoggingMode] = useState<'start' | 'end' | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');

    if (!status) return null;

    const { currentCycleDay, activeRule, planName } = status;

    // ... inside Dashboard

    const getAdvice = () => {
        if (!activeRule) return { title: 'Rest', text: 'No specific rule for today.' };

        const allTypes = [...BUILT_IN_FASTING_TYPES, ...(customFastingTypes || [])];
        const typeDef = allTypes.find(t => t.id === activeRule.type);

        if (!typeDef) return { title: 'Flow', text: activeRule.description || '' };

        if (!typeDef.slots || typeDef.slots.length === 0) {
            return { title: 'Nourish', text: 'No scheduled fasting. Focus on nutrient-dense foods.' };
        }

        // Calculate Window Pattern
        // Assuming user started the plan aligned with their cycle? 
        // Actually, "Day 1 20:00" usually means "Every day 20:00" for 24h windows.
        // For 48h windows, we need to know if today is Day 1 or Day 2.
        // We'll calculate offset from Cycle Start? 
        // activeRule.dayStart is the cycle day this rule started.
        // currentCycleDay is the global cycle day.
        // So days into this rule = currentCycleDay - activeRule.dayStart.
        // windowDay = (daysIntoRule) % (windowDuration / 24).


        const cycleDays = Math.ceil((typeDef.windowDuration || 24) / 24);

        // Find applicable slots for TODAY (currentWindowDay)
        // Note: Slots are stored as "D:HH:mm". D is 0-based.
        // We want to show "Fasting: 20:00 - 12:00" etc.



        const slotDesc = (typeDef.slots || []).map(s => {
            const [d1, h1, m1] = s.start.split(':');
            const [_d2, h2, m2] = s.end.split(':');
            const dayLabel = cycleDays > 1 ? `Day ${parseInt(d1) + 1} ` : '';
            return `${dayLabel}${h1}:${m1} - ${h2}:${m2}`;
        }).join(', ');

        return {
            title: typeDef.name,
            text: `${typeDef.description || ''} Pattern: ${slotDesc}`
        };
    };

    const advice = getAdvice();

    // Reality Check Logic
    const latest = cycleHistory[0];
    const isPeriodActive = latest && !latest.endDate;
    const todayStr = new Date().toISOString().split('T')[0];

    const handleStartClick = () => {
        setLoggingMode(isPeriodActive ? 'end' : 'start');
        setSelectedDate(todayStr);
    };

    const handleConfirmLog = () => {
        if (!selectedDate) return;

        if (loggingMode === 'start') {
            useSettingsStore.getState().logPeriodStart(selectedDate);
        } else {
            useSettingsStore.getState().logPeriodEnd(selectedDate);
        }
        setLoggingMode(null);
    };

    const getMinDate = () => {
        if (loggingMode === 'end' && latest) {
            return latest.startDate;
        }
        if (loggingMode === 'start' && latest && latest.endDate) {
            // Technically should be > last end date, but input min is inclusive.
            // Let's allow same day (maybe morning/night difference? unlikely but safe).
            // Better UX: next day.
            const nextDay = new Date(latest.endDate);
            nextDay.setDate(nextDay.getDate() + 1);
            return nextDay.toISOString().split('T')[0];
        }
        return undefined;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Cycle Card */}
            <div style={{
                background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%)',
                padding: 'var(--space-xl) var(--space-lg)',
                borderRadius: 'var(--radius-lg)',
                color: 'white',
                textAlign: 'center',
                boxShadow: 'var(--shadow-float)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{ opacity: 0.9, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Day {currentCycleDay}
                    </h3>
                    <div style={{ fontSize: '3rem', fontWeight: 800, margin: 'var(--space-xs) 0' }}>
                        {advice.title}
                    </div>
                    <p style={{ opacity: 0.9 }}>
                        {planName}
                    </p>
                </div>
            </div>

            {/* Advice Card */}
            <div style={{
                background: 'var(--c-surface)',
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)'
            }}>
                <h4 style={{ color: 'var(--c-text-muted)', marginBottom: 'var(--space-sm)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    Today's Guidance
                </h4>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{advice.text}</p>

            </div>

            {/* Reality Check Controls */}
            <div style={{
                marginBottom: 'var(--space-lg)',
                background: 'var(--c-surface)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-sm)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Reality Check</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>Is your body telling you something different?</p>
                    </div>

                    {!loggingMode && (
                        <button
                            onClick={handleStartClick}
                            style={{
                                background: isPeriodActive ? 'var(--c-surface)' : 'var(--c-accent)',
                                border: isPeriodActive ? '2px solid var(--c-text-main)' : 'none',
                                color: 'var(--c-text-main)',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            {isPeriodActive ? 'End Period' : 'Start Period'}
                        </button>
                    )}
                </div>

                {loggingMode && (
                    <div style={{
                        marginTop: 'var(--space-sm)',
                        padding: 'var(--space-sm)',
                        background: 'var(--c-bg-app)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-sm)'
                    }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                            {loggingMode === 'start' ? 'When did it start?' : 'When did it end?'}
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <input
                                type="date"
                                value={selectedDate}
                                max={todayStr}
                                min={getMinDate()}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid #ddd'
                                }}
                            />
                            <button
                                onClick={handleConfirmLog}
                                style={{
                                    background: 'var(--c-primary)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer'
                                }}
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setLoggingMode(null)}
                                style={{
                                    background: 'transparent',
                                    color: 'var(--c-text-muted)',
                                    border: '1px solid #ddd',
                                    padding: '8px 16px',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Calendar />

        </div>
    );
};

export default Dashboard;
