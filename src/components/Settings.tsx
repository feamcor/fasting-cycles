import { useSettingsStore } from '../store/useSettingsStore';
import { DEFAULT_PLANS } from '../data/defaultPlans';
import PlanManager from './PlanManager';
import FastingTypeManager from './FastingTypeManager';

const Settings = ({ onClose }: { onClose: () => void }) => {
    const {
        cycleLength,
        periodLength,
        setCycleLength,
        setPeriodLength,
    } = useSettingsStore();

    return (
        <section style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--c-surface)',
            zIndex: 100,
            padding: 'var(--space-lg)',
            overflowY: 'auto'
        }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                <h2>Settings & Plans</h2>
                <button onClick={onClose} style={{ background: 'transparent', fontSize: '1.5rem', border: 'none', cursor: 'pointer' }}>&times;</button>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

                {/* Basic Cycle Settings */}
                <div style={{ background: '#f9f9f9', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid #eee' }}>
                    <h3 style={{ marginTop: 0, fontSize: '1rem', color: 'var(--c-text-muted)' }}>Cycle Basics</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.9rem' }}>Cycle Length (Days)</label>
                            <input
                                type="number"
                                value={cycleLength}
                                onChange={(e) => setCycleLength(Number(e.target.value))}
                                style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.9rem' }}>Period Length (Days)</label>
                            <input
                                type="number"
                                value={periodLength}
                                onChange={(e) => setPeriodLength(Number(e.target.value))}
                                style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}
                            />
                        </div>
                    </div>
                </div>

                <PlanManager />

                <hr style={{ border: '0', borderTop: '1px solid #eee', margin: 0 }} />

                <FastingTypeManager />

                <div
                    onClick={() => {
                        if (confirm("Are you sure? This will delete all history.")) {
                            localStorage.removeItem('fasting-cycles-storage');
                            window.location.reload();
                        }
                    }}
                    style={{
                        marginTop: 'var(--space-xl)',
                        marginBottom: 'var(--space-xl)',
                        textAlign: 'center',
                        color: 'red',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        padding: '10px',
                        border: '1px solid red',
                        borderRadius: 'var(--radius-md)'
                    }}
                >
                    Reset All Data
                </div>
            </div>
        </section>
    );
};

export default Settings;
