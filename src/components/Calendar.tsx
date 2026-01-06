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
import { enUS, ptBR } from 'date-fns/locale';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslation } from '../hooks/useTranslation';
import type { TranslationKey } from '../i18n/translations';
import { DEFAULT_PLANS } from '../data/defaultPlans';
import { BUILT_IN_FASTING_TYPES } from '../data/fastingTypes';

const Calendar = () => {
    const { t, language } = useTranslation();
    const { lastPeriodStart, cycleLength, selectedPlanId, periodLength = 5, customPlans, customFastingTypes } = useSettingsStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Resolve Locale
    const dateLocale = language === 'pt_BR' ? ptBR : enUS;

    // Resolve Plan
    const allPlans = [...DEFAULT_PLANS, ...(customPlans || [])];
    const plan = allPlans.find(p => p.id === selectedPlanId) || DEFAULT_PLANS[0];

    // Resolve Fasting Types
    const allFastingTypes = [...BUILT_IN_FASTING_TYPES, ...(customFastingTypes || [])];

    // Extract unique fasting types used in this plan for the legend
    const planFastingTypes = Array.from(new Set(plan.rules.map(r => r.type)))
        .map(typeId => allFastingTypes.find(t => t.id === typeId))
        .filter((t): t is typeof allFastingTypes[0] => !!t);

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
                    {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
                </span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    style={{ background: 'transparent', fontSize: '1.2rem', padding: 'var(--space-xs)' }}>
                    →
                </button>
            </div>
        );
    };

    const daysOfWeek = () => {
        // Simple manual array or use date-fns to generate?
        // Let's use hardcoded for now but localized? Or just symbols?
        // S M T W T F S is quite universal but in PT it is D S T Q Q S S
        // Let's generate from date-fns
        const weekStart = startOfWeek(currentMonth, { locale: dateLocale });
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            // Get first letter
            weekDays.push(format(eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { locale: dateLocale }) })[i], 'EEEEE', { locale: dateLocale }));
        }

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 'var(--space-xs)' }}>
                {weekDays.map((day, i) => (
                    <div key={i} style={{
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
        const isPeriod = adjustedCycleDay >= 1 && adjustedCycleDay <= periodLength;
        const backgroundColor = isPeriod ? 'var(--c-period-bg)' : 'var(--c-neutral-bg)';
        const color = 'var(--c-text-main)';

        // 2. Determine Border (Fasting Rules)
        let border = '2px solid transparent';
        let showSlash = false;

        if (rule) {
            const typeDef = allFastingTypes.find(t => t.id === rule.type);
            if (typeDef) {
                if (typeDef.color) {
                    border = `3px solid ${typeDef.color}`;
                }
                // Special visual for NO_FASTING if desired, or just rely on color
                if (typeDef.id === 'NO_FASTING') {
                    showSlash = true;
                }
            }
        }

        return { cycleDay: adjustedCycleDay, rule, backgroundColor, border, showSlash, color };
    };

    const cells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { locale: dateLocale });
        const endDate = endOfWeek(monthEnd, { locale: dateLocale });

        const dateFormat = "d";
        const dayArray = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--space-xs)' }}>
                {dayArray.map((date, i) => {
                    const isSelectedMonth = isSameMonth(date, monthStart);
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
                            opacity: 1,
                            color: isSelectedMonth ? color : 'var(--c-text-muted)',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            fontWeight: isToday ? 'bold' : 'normal'
                        }}>
                            {/* Diagonal Slash for NO_FASTING */}
                            {showSlash && (
                                <div style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '3px',
                                    background: 'var(--c-no-fasting-border)',
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
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--c-period-bg)' }} /> {t('period')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--c-neutral-bg)' }} /> {t('nonPeriod')}
                </div>

                {planFastingTypes.map(type => (
                    <div key={type.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            border: `3px solid ${type.color || 'transparent'}`,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {type.id === 'NO_FASTING' && (
                                <div style={{
                                    width: '100%',
                                    height: '3px',
                                    background: type.color || 'currentColor',
                                    transform: 'rotate(-45deg)'
                                }} />
                            )}
                        </div>
                        {type.isSystem ? t(`typeName${type.id}` as TranslationKey) : type.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
