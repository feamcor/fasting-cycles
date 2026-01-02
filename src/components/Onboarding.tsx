import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

const Onboarding = () => {
    const { setLastPeriodStart, setCycleLength, setPeriodLength } = useSettingsStore();

    const [date, setDate] = useState('');
    const [avgCycle, setAvgCycle] = useState(28);
    const [avgPeriod, setAvgPeriod] = useState(5);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (date) {
            setLastPeriodStart(date);
            setCycleLength(Number(avgCycle));
            setPeriodLength(Number(avgPeriod));
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-lg)',
            marginTop: 'var(--space-xl)'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: 'var(--space-sm)' }}>Welcome, Sister</h2>
                <p style={{ color: 'var(--c-text-muted)' }}>Let's sync with your natural rhythm.</p>
            </div>

            <form onSubmit={handleSubmit} style={{
                background: 'var(--c-surface)',
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-md)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <label htmlFor="lastPeriod" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        When did your last period start?
                    </label>
                    <input
                        type="date"
                        id="lastPeriod"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{
                            padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid #e0e0e0',
                            fontSize: '1rem',
                            backgroundColor: 'var(--c-bg-app)'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <label htmlFor="cycleLength" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        Average Cycle Length (Days)
                    </label>
                    <input
                        type="number"
                        id="cycleLength"
                        value={avgCycle}
                        onChange={(e) => setAvgCycle(Number(e.target.value))}
                        min="20" max="45"
                        style={{
                            padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid #e0e0e0',
                            fontSize: '1rem',
                            backgroundColor: 'var(--c-bg-app)'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <label htmlFor="periodLength" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        Average Period Length (Days)
                    </label>
                    <input
                        type="number"
                        id="periodLength"
                        value={avgPeriod}
                        onChange={(e) => setAvgPeriod(Number(e.target.value))}
                        min="3" max="10"
                        style={{
                            padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid #e0e0e0',
                            fontSize: '1rem',
                            backgroundColor: 'var(--c-bg-app)'
                        }}
                    />
                </div>

                <button type="submit" style={{
                    marginTop: 'var(--space-md)',
                    background: 'var(--c-primary)',
                    color: 'white',
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    Start Tracking
                </button>
            </form>
        </div>
    );
};

export default Onboarding;
