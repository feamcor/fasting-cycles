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
    const { lastPeriodStart, cycleLength, selectedPlanId, periodLength = 5 } = useSettingsStore();
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

        // Simple cycle calculation
        const cycleDay = (diff % cycleLength) + 1;
        const adjustedCycleDay = cycleDay <= 0 ? cycleDay + cycleLength : cycleDay;

        // Find rule
        const rule = plan.rules.find(r => {
            const end = r.dayEnd === 'END' ? cycleLength : r.dayEnd;
            return adjustedCycleDay >= r.dayStart && adjustedCycleDay <= end;
        });

        // 1. Determine Background (Period vs Non-Period)
        // Check strict period days from user setting
        const isPeriod = adjustedCycleDay >= 1 && adjustedCycleDay <= periodLength;
        const backgroundColor = isPeriod ? 'var(--c-period-bg)' : 'var(--c-neutral-bg)';
        const color = 'var(--c-text-main)'; // Always dark text properly

        // 2. Determine Border (Fasting Rules)
        // Default transparent
        let border = '2px solid transparent';
        let showSlash = false;

        if (rule) {
            switch (rule.type) {
                case 'NO_FASTING':
                    border = '3px solid var(--c-no-fasting-border)'; // Darker Gray
                    showSlash = true;
                    break;
                case 'LIMIT_HOURS':
                    border = '3px solid var(--c-black-border)'; // Thick black
                    showSlash = false; // Gentle limit is just border
                    break;
                case 'STANDARD':
                    border = '3px solid var(--c-power-border)'; // Bright red
                    break;
            }
        }

        return { cycleDay: adjustedCycleDay, rule, backgroundColor, border, showSlash, color };
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
                    const isSelectedMonth = isSameMonth(date, monthStart);

                    // If not selected month, just white/transparent background, no circle
                    const dayInfo = isSelectedMonth ? getDayInfo(date) : {};
                    const { backgroundColor, border, showSlash, color } = dayInfo;

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
                            border: isSelectedMonth ? border : 'none',
                            opacity: 1, // Full opacity for visual clarity as requested
                            color: isSelectedMonth ? color : 'var(--c-text-muted)',
                            fontSize: '1.2rem', // Increased font size as requested
                            cursor: 'pointer',
                            fontWeight: isToday ? 'bold' : 'normal'
                        }}>
                            {/* Diagonal Slash for NO_FASTING */}
                            {showSlash && (
                                <div style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '3px', /* Matching thick border */
                                    background: 'var(--c-no-fasting-border)', // Matching new gray color
                                    transform: 'rotate(-45deg)',
                                }} />
                            )}
                            <span style={{ zIndex: 1, textDecoration: isToday ? 'underline' : 'none' }}>{format(date, dateFormat)}</span>
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
                color: 'var(--c-text-muted)',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--c-period-bg)' }} /> Period
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--c-neutral-bg)' }} /> Non-Period
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, border: '3px solid var(--c-no-fasting-border)', borderRadius: '50%', position: 'relative' }}>
                        <div style={{ width: '100%', height: '3px', background: 'var(--c-no-fasting-border)', transform: 'rotate(-45deg)' }} />
                    </div> No Fasting
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '3px solid var(--c-black-border)' }} /> Gentle
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '3px solid var(--c-power-border)' }} /> Power
                </div>
            </div>
        </div>
    );
};

export default Calendar;
