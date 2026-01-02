import { useSettingsStore } from '../store/useSettingsStore';
import { DEFAULT_PLANS } from '../data/defaultPlans';

const Settings = ({ onClose }: { onClose: () => void }) => {
    const {
        cycleLength,
        periodLength,
        selectedPlanId,
        setCycleLength,
        setPeriodLength,
        setSelectedPlanId
    } = useSettingsStore();

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--c-bg-app)',
            zIndex: 100,
            padding: 'var(--space-lg)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-xl)'
            }}>
                <h2>Settings</h2>
                <button onClick={onClose} style={{ fontSize: '1.5rem', background: 'transparent' }}>×</button>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

                {/* Cycle Settings */}
                <section>
                    <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', color: 'var(--c-text-muted)' }}>Cycle Details</h3>
                    <div style={{ background: 'var(--c-surface)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>

                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.9rem' }}>Log New Period</label>
                            <input
                                type="date"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        if (confirm(`Log period starting on ${e.target.value}? This will update your history.`)) {
                                            useSettingsStore.getState().logPeriod(e.target.value);
                                        }
                                    }
                                }}
                                style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', marginTop: '4px' }}>
                                Entering a new date will update your average cycle length.
                            </p>
                        </div>

                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.9rem' }}>Cycle Length (Days)</label>
                            <input
                                type="number"
                                value={cycleLength}
                                onChange={(e) => setCycleLength(Number(e.target.value))}
                                style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.9rem' }}>Period Length (Days)</label>
                            <input
                                type="number"
                                value={periodLength}
                                onChange={(e) => setPeriodLength(Number(e.target.value))}
                                style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}
                            />
                        </div>
                    </div>
                </section>

                {/* Plan Selection */}
                <section>
                    <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', color: 'var(--c-text-muted)' }}>Fasting Plan</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {DEFAULT_PLANS.map(plan => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlanId(plan.id)}
                                style={{
                                    background: 'var(--c-surface)',
                                    padding: 'var(--space-md)',
                                    borderRadius: 'var(--radius-md)',
                                    border: selectedPlanId === plan.id ? '2px solid var(--c-primary)' : '2px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{plan.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)' }}>{plan.description}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Danger Zone */}
                <section style={{ marginTop: 'auto' }}>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to reset all data?')) {
                                useSettingsStore.getState().setLastPeriodStart(null);
                                onClose();
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: 'var(--space-md)',
                            background: 'transparent',
                            border: '1px solid #ff6b6b',
                            color: '#ff6b6b',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Reset All Data
                    </button>
                </section>

            </div>
        </div>
    );
};

export default Settings;
