import { useState } from 'react';
import type { Plan, FastingRule } from '../types';

interface PlanEditorProps {
    initialPlan?: Plan;
    onSave: (plan: Plan) => void;
    onCancel: () => void;
    readOnly?: boolean;
}

import { useSettingsStore } from '../store/useSettingsStore';

const PlanEditor = ({ initialPlan, onSave, onCancel, readOnly = false }: PlanEditorProps) => {
    const { customFastingTypes = [] } = useSettingsStore();
    const [name, setName] = useState(initialPlan?.name || '');
    const [description, setDescription] = useState(initialPlan?.description || '');
    const [rules, setRules] = useState<FastingRule[]>(initialPlan?.rules || []);

    const handleAddRule = () => {
        const lastRule = rules[rules.length - 1];
        const start = lastRule ? (lastRule.dayEnd === 'END' ? 29 : (lastRule.dayEnd as number) + 1) : 1;

        const newRule: FastingRule = {
            dayStart: start,
            dayEnd: start + 4,
            type: 'STANDARD',
            description: ''
        };
        setRules([...rules, newRule]);
    };

    const updateRule = (index: number, field: keyof FastingRule, value: any) => {
        const newRules = [...rules];
        newRules[index] = { ...newRules[index], [field]: value };
        setRules(newRules);
    };

    const removeRule = (index: number) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const plan: Plan = {
            id: initialPlan?.id || `custom-${Date.now()}`,
            name,
            description,
            rules
        };
        onSave(plan);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Plan Name</label>
                <input
                    required
                    value={name}
                    disabled={readOnly}
                    onChange={e => setName(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Description</label>
                <textarea
                    value={description}
                    disabled={readOnly}
                    onChange={e => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid #ddd', minHeight: '60px' }}
                />
            </div>

            <div style={{ marginTop: 'var(--space-md)' }}>
                <h4 style={{ marginBottom: 'var(--space-sm)' }}>Rules</h4>

                {rules.map((rule, i) => (
                    <div key={i} style={{
                        background: 'var(--c-bg-app)',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-sm)',
                        border: '1px solid #eee'
                    }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.8rem' }}>Start Day</label>
                                <input
                                    type="number"
                                    value={rule.dayStart}
                                    disabled={readOnly}
                                    onChange={e => updateRule(i, 'dayStart', Number(e.target.value))}
                                    style={{ width: '100%', padding: '4px' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.8rem' }}>End Day</label>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <input
                                        type="number"
                                        value={rule.dayEnd === 'END' ? 99 : rule.dayEnd}
                                        disabled={readOnly || rule.dayEnd === 'END'}
                                        onChange={e => updateRule(i, 'dayEnd', Number(e.target.value))}
                                        style={{ width: '100%', padding: '4px' }}
                                    />
                                    <button type="button" disabled={readOnly} onClick={() => updateRule(i, 'dayEnd', rule.dayEnd === 'END' ? rule.dayStart + 1 : 'END')} style={{ fontSize: '0.7rem' }}>
                                        {rule.dayEnd === 'END' ? 'Set #' : 'End'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.8rem' }}>Type</label>
                            <select
                                value={rule.type}
                                disabled={readOnly}
                                onChange={e => updateRule(i, 'type', e.target.value)}
                                style={{ width: '100%', padding: '4px' }}
                            >
                                <optgroup label="Built-in">
                                    <option value="STANDARD">Standard</option>
                                    <option value="LIMIT_HOURS">Limit Hours (Flexible)</option>
                                    <option value="NO_FASTING">No Fasting</option>
                                </optgroup>
                                {customFastingTypes.length > 0 && (
                                    <optgroup label="My Custom Types">
                                        {customFastingTypes.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.fastingHours}h)</option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>

                        {rule.type === 'LIMIT_HOURS' && (
                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.8rem' }}>Max Hours</label>
                                <input
                                    type="number"
                                    value={rule.allowedHours || 12}
                                    disabled={readOnly}
                                    onChange={e => updateRule(i, 'allowedHours', Number(e.target.value))}
                                    style={{ width: '100%', padding: '4px' }}
                                />
                            </div>
                        )}

                        {/* Show info for custom types */}
                        {customFastingTypes.find(t => t.id === rule.type) && (
                            <div style={{ marginBottom: '8px', fontSize: '0.8rem', color: 'var(--c-text-muted)', background: '#f5f5f5', padding: '4px', borderRadius: '4px' }}>
                                ℹ️ {customFastingTypes.find(t => t.id === rule.type)?.description}
                            </div>
                        )}

                        {!readOnly && (
                            <button type="button" onClick={() => removeRule(i)} style={{ color: 'red', fontSize: '0.8rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                Remove Rule
                            </button>
                        )}
                    </div>
                ))}

                {!readOnly && (
                    <button type="button" onClick={handleAddRule} style={{
                        width: '100%',
                        padding: '8px',
                        background: '#eee',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer'
                    }}>
                        + Add Cycle Phase Rule
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <button type="button" onClick={onCancel} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #ccc', borderRadius: 'var(--radius-md)' }}>
                    {readOnly ? 'Close' : 'Cancel'}
                </button>
                {!readOnly && (
                    <button type="submit" style={{ flex: 1, padding: '10px', background: 'var(--c-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)' }}>
                        Save Plan
                    </button>
                )}
            </div>
        </form>
    );
};

export default PlanEditor;
