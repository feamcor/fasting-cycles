import { useState, useRef, type ChangeEvent } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslation } from '../hooks/useTranslation';

import PlanManager from './PlanManager';
import FastingTypeManager from './FastingTypeManager';
import { generateMockHistory } from '../utils/seedData';
import type { UserSettings } from '../types';

const Settings = ({ onClose }: { onClose: () => void }) => {
    const { t } = useTranslation();
    const {
        cycleLength,
        periodLength,
        setCycleLength,
        setPeriodLength,
        resetAll
    } = useSettingsStore();

    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleExport = () => {
        const state = useSettingsStore.getState();
        const dataToExport: UserSettings = {
            cycleLength: state.cycleLength,
            periodLength: state.periodLength,
            lastPeriodStart: state.lastPeriodStart,
            cycleHistory: state.cycleHistory,
            selectedPlanId: state.selectedPlanId,
            isFastingEnabled: state.isFastingEnabled,
            customPlans: state.customPlans,
            customFastingTypes: state.customFastingTypes,
        };

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const mi = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');

        a.download = `fasting-cycles-export-${yyyy}${mm}${dd}-${hh}${mi}${ss}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsedData = JSON.parse(content);

                // Simple validation: check if critical fields exist
                if (typeof parsedData.cycleLength === 'number' && Array.isArray(parsedData.cycleHistory)) {
                    if (window.confirm(t('confirmImport') || 'Importing will replace all current data. Are you sure?')) {
                        resetAll();
                        useSettingsStore.setState(parsedData);
                        alert(t('importSuccess') || 'Data imported successfully!');
                        window.location.reload();
                    }
                } else {
                    alert(t('invalidFile') || 'Invalid backup file');
                }
            } catch (error) {
                console.error('Import error:', error);
                alert(t('importError') || 'Error importing file');
            }
        };
        reader.readAsText(file);
        // Reset input so same file can be selected again if needed
        event.target.value = '';
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
                <h2>{t('settingsAndPlans')}</h2>
                <button onClick={onClose} style={{ background: 'transparent', fontSize: '1.5rem', border: 'none', cursor: 'pointer' }}>&times;</button>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

                {/* Basic Cycle Settings */}
                <div style={{ background: '#f9f9f9', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--c-text-muted)', margin: 0, marginBottom: '16px' }}>{t('cycleBasics')}</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.9rem' }}>{t('cycleLength')}</label>
                            <input
                                type="number"
                                value={cycleLength}
                                onChange={(e) => setCycleLength(Number(e.target.value))}
                                style={{ width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.9rem' }}>{t('periodLength')}</label>
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

                {/* No HR here as per request */}

                <FastingTypeManager />

                {/* Data Management Section */}
                <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '12px', border: '1px solid #e9ecef' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--c-text-muted)', margin: 0, marginBottom: '16px' }}>{t('dataManagement') || 'Data Management'}</h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button onClick={handleExport} style={{
                            background: '#fff',
                            color: '#333',
                            border: '1px solid #ddd',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            flex: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            fontWeight: 500
                        }}>
                            ⬇️ {t('exportData') || 'Export Data'}
                        </button>
                        <button onClick={handleImportClick} style={{
                            background: '#fff',
                            color: '#333',
                            border: '1px solid #ddd',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            flex: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            fontWeight: 500
                        }}>
                            ⬆️ {t('importData') || 'Import Data'}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json"
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e9ecef' }}>
                        <button onClick={() => {
                            if (confirm('This will Overwrite your current history with test data. Are you sure?')) {
                                handleSeedData();
                            }
                        }} style={{
                            background: 'transparent',
                            color: '#6c757d',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            width: '100%',
                            textAlign: 'left',
                            textDecoration: 'underline'
                        }}>
                            🌱 {t('seedData')}
                        </button>
                    </div>
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
                        {t('resetAllData')}
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
                        <p style={{ color: 'red', fontWeight: 'bold', marginBottom: '10px' }}>{t('areYouSureReset')}</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={handleReset}
                                style={{
                                    background: 'red', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'
                                }}
                            >
                                {t('yesClear')}
                            </button>
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                style={{
                                    background: 'transparent', color: '#333', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'
                                }}
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Settings;
