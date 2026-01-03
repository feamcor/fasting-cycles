import { useSettingsStore } from '../store/useSettingsStore';
import { DEFAULT_PLANS } from '../data/defaultPlans';
import PlanManager from './PlanManager';

const Settings = ({ onClose }: { onClose: () => void }) => {
    const {
        cycleLength,
        periodLength,
        setCycleLength,
        setPeriodLength,
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', overflowY: 'auto' }}>

                {/* Cycle Settings */}
                <section>
                    <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem', color: 'var(--c-text-muted)' }}>Cycle Details</h3>
                    <div style={{ background: 'var(--c-surface)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>



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

                {/* Fasting Plan Management */}
                <section>
                    <PlanManager />
                </section>

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
        </div>
    );
};

export default Settings;
