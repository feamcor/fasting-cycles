import { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    differenceInCalendarDays,
    parseISO
} from 'date-fns';
import { useSettingsStore } from '../store/useSettingsStore';
import { DEFAULT_PLANS } from '../data/defaultPlans';

const Calendar = () => {
    const { lastPeriodStart, cycleLength, selectedPlanId } = useSettingsStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const plan = DEFAULT_PLANS.find(p => p.id === selectedPlanId) || DEFAULT_PLANS[0];

    const header = () => {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-md)',
                padding: '0 var(--space-xs)'
            }}>
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    style={{ background: 'transparent', fontSize: '1.2rem', padding: 'var(--space-xs)' }}>
                    ←
                </button>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    style={{ background: 'transparent', fontSize: '1.2rem', padding: 'var(--space-xs)' }}>
                    →
                </button>
            </div>
        );
    };

    const daysOfWeek = () => {
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 'var(--space-xs)' }}>
                {days.map(day => (
                    <div key={day} style={{
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        color: 'var(--c-text-muted)',
                        fontWeight: 600
                    }}>
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const getDayInfo = (date: Date) => {
        if (!lastPeriodStart) return {};

        const startDate = parseISO(lastPeriodStart);
        const diff = differenceInCalendarDays(date, startDate);

        // Simple cycle calculation (future work: handle irregular cycles)
        const cycleDay = (diff % cycleLength) + 1;
        // Adjust for negative diffs (past dates before start) - actually mostly relevant for cycle mapping
        const adjustedCycleDay = cycleDay <= 0 ? cycleDay + cycleLength : cycleDay;

        // Find rule
        const rule = plan.rules.find(r => {
            const end = r.dayEnd === 'END' ? cycleLength : r.dayEnd;
            return adjustedCycleDay >= r.dayStart && adjustedCycleDay <= end;
        });

        let backgroundColor = 'transparent';
        let borderColor = 'transparent';

        if (rule) {
            switch (rule.type) {
                case 'NO_FASTING':
                    backgroundColor = 'var(--c-accent)'; // Example: Pink/Red for period/luteal end
                    break;
                case 'LIMIT_HOURS':
                    backgroundColor = 'var(--c-primary-light)';
                    break;
                case 'STANDARD':
                    backgroundColor = 'transparent';
                    borderColor = 'var(--c-primary)';
                    break;
            }
        }

        // Highlight period days specifically (approx 1-5)
        const isPeriod = adjustedCycleDay >= 1 && adjustedCycleDay <= (useSettingsStore.getState().periodLength || 5);
        if (isPeriod) {
            backgroundColor = 'var(--c-accent)';
            borderColor = 'transparent';
        }

        return { cycleDay: adjustedCycleDay, rule, backgroundColor, borderColor, isPeriod };
    };

    const cells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const dayArray = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--space-xs)' }}>
                {dayArray.map((date, i) => {
                    const { backgroundColor, borderColor, isPeriod } = getDayInfo(date);
                    const isSelectedMonth = isSameMonth(date, monthStart);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <div key={i} style={{
                            aspectRatio: '1/1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            borderRadius: '50%',
                            background: isSelectedMonth ? backgroundColor : 'transparent',
                            border: `2px solid ${isToday ? 'var(--c-text-main)' : borderColor}`,
                            opacity: isSelectedMonth ? (isPeriod ? 0.8 : (backgroundColor !== 'transparent' ? 0.4 : 1)) : 0.2,
                            color: isSelectedMonth ? 'inherit' : 'var(--c-text-muted)',
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                        }}>
                            <span>{format(date, dateFormat)}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={{
            background: 'var(--c-surface)',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)'
        }}>
            {header()}
            {daysOfWeek()}
            {cells()}
            <div style={{
                marginTop: 'var(--space-md)',
                display: 'flex',
                gap: 'var(--space-md)',
                fontSize: '0.8rem',
                justifyContent: 'center',
                color: 'var(--c-text-muted)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-accent)' }} /> Period/Relax
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-primary-light)' }} /> Gentle
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid var(--c-primary)' }} /> Power
                </div>
            </div>
        </div>
    );
};

export default Calendar;
