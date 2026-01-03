import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

import PlanManager from './PlanManager';
import FastingTypeManager from './FastingTypeManager';
import { generateMockHistory } from '../utils/seedData';

const Settings = ({ onClose }: { onClose: () => void }) => {
    const {
        cycleLength,
        periodLength,
        setCycleLength,
        setPeriodLength,
        resetAll
    } = useSettingsStore();

    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleReset = () => {
        resetAll();
        setShowResetConfirm(false);
        // Optional: reload to ensure all states are clean, but resetAll should handle it.
        // But for a "hard reset" feel, reload is safer to clear any local component state too.
        window.location.reload();
    };

    const handleSeedData = () => {
        const mockHistory = generateMockHistory();
        useSettingsStore.setState({ cycleHistory: mockHistory, lastPeriodStart: mockHistory[0]?.startDate || null });
        alert('Added 1 year of test data!');
    };

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

                <div style={{ padding: 'var(--space-md)', background: '#f0f8ff', borderRadius: 'var(--radius-md)', border: '1px dashed #add8e6', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 var(--space-sm) 0', fontSize: '0.9rem', color: '#0066cc' }}>Dev Tools</p>
                    <button onClick={handleSeedData} style={{ background: '#0066cc', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                        🌱 Seed 1 Year Test Data
                    </button>
                </div>

                {!showResetConfirm ? (
                    <div
                        onClick={() => setShowResetConfirm(true)}
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
                ) : (
                    <div style={{
                        marginTop: 'var(--space-xl)',
                        marginBottom: 'var(--space-xl)',
                        background: '#fff0f0',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid red',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: 'red', fontWeight: 'bold', marginBottom: '10px' }}>Are you sure? This will delete ALL custom plans, fasting types, and cycle history.</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={handleReset}
                                style={{
                                    background: 'red', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'
                                }}
                            >
                                Yes, Clear Everything
                            </button>
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                style={{
                                    background: 'transparent', color: '#333', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Settings;
