import { useState } from 'react';
import { useCycleCalculator } from '../hooks/useCycleCalculator';
import { useSettingsStore } from '../store/useSettingsStore';
import { BUILT_IN_FASTING_TYPES } from '../data/fastingTypes';
import { useTranslation } from '../hooks/useTranslation';
import Calendar from './Calendar';


const Dashboard = () => {
    const status = useCycleCalculator();
    const { t } = useTranslation();
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
        if (!activeRule) return { title: t('rest'), text: t('noRule') };

        const allTypes = [...BUILT_IN_FASTING_TYPES, ...(customFastingTypes || [])];
        const typeDef = allTypes.find(t => t.id === activeRule.type);

        if (!typeDef) return { title: t('flow'), text: activeRule.description || '' };

        if (!typeDef.slots || typeDef.slots.length === 0) {
            return { title: t('nourish'), text: t('noScheduledFasting') };
        }

        const cycleDays = Math.ceil((typeDef.windowDuration || 24) / 24);

        const slotDesc = (typeDef.slots || []).map(s => {
            const [d1, h1, m1] = s.start.split(':');
            const [_d2, h2, m2] = s.end.split(':');
            const dayLabel = cycleDays > 1 ? `${t('days')} ${parseInt(d1) + 1} ` : '';
            return `${dayLabel}${h1}:${m1} - ${h2}:${m2}`;
        }).join(', ');

        return {
            title: typeDef.isSystem ? t(`typeName${typeDef.id}` as any) : typeDef.name,
            text: `${typeDef.isSystem ? t(`typeDesc${typeDef.id}` as any) : (typeDef.description || '')} Pattern: ${slotDesc}`
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
                        {t('days')} {currentCycleDay}
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
                    {t('guidance')}
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
                        <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{t('realityCheck')}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>{t('realityCheckSubtitle')}</p>
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
                            {isPeriodActive ? t('endPeriod') : t('startPeriod')}
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
                            {loggingMode === 'start' ? t('whenStarted') : t('whenEnded')}
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
                                {t('confirm')}
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
                                {t('cancel')}
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
