import { useState, type FormEvent } from 'react';
import type { FastingRule, Plan } from '../types';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslation } from '../hooks/useTranslation';

interface PlanEditorProps {
    initialPlan?: Plan;
    onSave: (plan: Plan) => void;
    onCancel: () => void;
    readOnly?: boolean;
}

const PlanEditor = ({ initialPlan, onSave, onCancel, readOnly = false }: PlanEditorProps) => {
    const { t } = useTranslation();
    const { customFastingTypes = [] } = useSettingsStore();

    // Helper: Get required step size (in days) for a given type
    const getStepSizeForType = (typeId: string): number => {
        const customType = customFastingTypes.find(t => t.id === typeId);
        if (customType) {
            // E.g. 48h -> 2 days. 24h -> 1 day. 16h -> 1 day (standard).
            // Logic: windowDuration / 24, minimum 1.
            return Math.max(1, Math.round(customType.windowDuration / 24));
        }
        return 1; // Built-in types (Standard, Limit Hours) are daily (1-day step).
    };

    const normalizeRules = (rawRules: FastingRule[]): FastingRule[] => {
        if (rawRules.length === 0) return [];

        const normalized: FastingRule[] = [];
        let currentStart = 1;

        for (let i = 0; i < rawRules.length; i++) {
            const rule = { ...rawRules[i] };

            rule.dayStart = currentStart;

            let numericEnd = rule.dayEnd === 'END' ? 28 : rule.dayEnd;

            if (numericEnd < currentStart) numericEnd = currentStart;
            if (numericEnd > 28) numericEnd = 28;

            // Enforce Step Size for THIS rule
            const step = getStepSizeForType(rule.type);
            const duration = numericEnd - rule.dayStart + 1;

            // Snap duration to multiple of step
            if (duration % step !== 0) {
                // Round to nearest multiple
                const validDuration = Math.round(duration / step) * step;
                // Ensure at least 1 step
                const finalDuration = Math.max(step, validDuration);
                numericEnd = rule.dayStart + finalDuration - 1;
            }

            // Max constraint
            const remainingRules = rawRules.length - 1 - i;
            const maxEndForThisRule = 28 - remainingRules; // Simplistic (min 1 day per remaining rule) 
            // Better: min 1 *step* per remaining rule? 
            // For now assume subsequent rules *could* be 1-day step types. 
            // If they are multi-day, validation might fail later. 
            // We just ensure minimal physical space.

            if (numericEnd > maxEndForThisRule) {
                numericEnd = maxEndForThisRule;
                // Re-snap down if needed?
                const dur = numericEnd - rule.dayStart + 1;
                if (dur % step !== 0) {
                    numericEnd = rule.dayStart + (Math.floor(dur / step) * step) - 1;
                }
            }
            // Ensure numericEnd >= start (after all adjustments)
            if (numericEnd < rule.dayStart) {
                // If we can't fit even one step, we have a problem.
                // Force minimum?
                numericEnd = rule.dayStart + step - 1;
            }

            if (rule.dayEnd !== 'END') {
                rule.dayEnd = numericEnd;
            } else {
                if (numericEnd < 28) {
                    rule.dayEnd = numericEnd;
                }
            }

            normalized.push(rule);
            currentStart = (typeof rule.dayEnd === 'number' ? rule.dayEnd : 28) + 1;
        }
        return normalized;
    };

    const [name, setName] = useState(initialPlan?.name || '');
    const [description, setDescription] = useState(initialPlan?.description || '');
    const [rules, setRules] = useState<FastingRule[]>(() => {
        return initialPlan?.rules ? normalizeRules(initialPlan.rules) : [];
    });

    const adjustRules = (index: number, field: 'dayStart' | 'dayEnd', value: number) => {
        const newRules = [...rules];

        // Identify target boundary
        let targetBoundaryIndex = -1; // Index of the rule whose End we are modifying

        if (field === 'dayEnd') {
            targetBoundaryIndex = index;
        } else if (field === 'dayStart') {
            if (index === 0) return;
            targetBoundaryIndex = index - 1;
            // If user requested Start X, it means Prev End is X-1
            value = value - 1;
        }

        if (targetBoundaryIndex >= 0 && targetBoundaryIndex < newRules.length) {
            const ruleToAdjust = newRules[targetBoundaryIndex];
            const step = getStepSizeForType(ruleToAdjust.type);
            const startOfTarget = ruleToAdjust.dayStart;

            let proposedEnd = value;

            // Ensure proposedEnd is at least startOfTarget + step - 1
            if (proposedEnd < startOfTarget + step - 1) {
                proposedEnd = startOfTarget + step - 1;
            }

            // Snap proposedEnd to a multiple of step
            const duration = proposedEnd - startOfTarget + 1;
            const snappedDuration = Math.max(step, Math.round(duration / step) * step);
            proposedEnd = startOfTarget + snappedDuration - 1;

            // Apply the change to the specific rule
            newRules[targetBoundaryIndex].dayEnd = proposedEnd;

            // If we are adjusting the end of a rule, and it's not the last rule,
            // ensure the next rule's start is consistent.
            if (targetBoundaryIndex < newRules.length - 1) {
                const nextRule = newRules[targetBoundaryIndex + 1];
                if (nextRule.dayStart <= proposedEnd) {
                    nextRule.dayStart = proposedEnd + 1;
                }
            }

            // If we are adjusting the start of a rule (which means we adjusted the previous rule's end)
            // ensure the current rule's start is consistent.
            if (field === 'dayStart' && index > 0) {
                const prevRule = newRules[index - 1];
                if (newRules[index].dayStart <= (typeof prevRule.dayEnd === 'number' ? prevRule.dayEnd : 28)) {
                    newRules[index].dayStart = (typeof prevRule.dayEnd === 'number' ? prevRule.dayEnd : 28) + 1;
                }
            }

            // Re-normalize the entire set of rules to handle all ripple effects and constraints
            setRules(normalizeRules(newRules));
            return;
        }

        // If for some reason the targetBoundaryIndex is invalid, just set the rules
        // (This should ideally not be reached for valid user interactions)
        setRules(normalizeRules(newRules));
    };

    const updateRuleType = (index: number, type: string) => {
        const newRules = [...rules];
        newRules[index] = { ...newRules[index], type };
        // Changing type might change step size requirement, so normalize
        setRules(normalizeRules(newRules));
    };

    const handleAddRule = () => {
        const lastRule = rules[rules.length - 1];
        let start = 1;
        if (lastRule) {
            const lastEnd = lastRule.dayEnd === 'END' ? 28 : lastRule.dayEnd;
            start = lastEnd + 1;
        }

        // Check if there is space (at least 1 day, or 1 step?)
        // Default new rule is STANDARD (step 1). So 1 day is enough.
        // If the cycle is already full (start > 28), we cannot add a new rule directly.
        // We could try to shrink the last rule, but for simplicity, let's prevent adding if no space.
        if (start > 28) {
            console.warn("Cannot add a new rule: no space left in the cycle.");
            return;
        }

        const newRule: FastingRule = {
            dayStart: start,
            dayEnd: Math.min(start + getStepSizeForType('STANDARD') - 1, 28), // Default to 1 day, or step size if different
            type: 'STANDARD',
            description: ''
        };
        setRules(normalizeRules([...rules, newRule]));
    };

    const removeRule = (index: number) => {
        const newRules = rules.filter((_, i) => i !== index);
        setRules(normalizeRules(newRules));
    };

    const toggleEnd = (index: number) => {
        const newRules = [...rules];
        const rule = newRules[index];

        if (rule.dayEnd === 'END') {
            // If it's 'END', change it to a specific day.
            // We'll let normalizeRules figure out the exact day, but provide a hint.
            rule.dayEnd = 28;
        } else {
            // If it's a specific day, change it to 'END'.
            rule.dayEnd = 'END';
        }
        setRules(normalizeRules(newRules));
    };

    const handleSubmit = (e: FormEvent) => {
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
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>{t('planName')}</label>
                <input
                    required
                    value={name}
                    disabled={readOnly}
                    onChange={e => setName(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid #ddd' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>{t('description')}</label>
                <textarea
                    value={description}
                    disabled={readOnly}
                    onChange={e => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid #ddd', minHeight: '60px' }}
                />
            </div>

            <div style={{ marginTop: 'var(--space-md)' }}>
                <h4 style={{ marginBottom: 'var(--space-sm)' }}>{t('rules')}</h4>

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
                                <label style={{ fontSize: '0.8rem' }}>{t('startDay')}</label>
                                <input
                                    type="number"
                                    value={rule.dayStart}
                                    disabled={readOnly || i === 0}
                                    onChange={e => adjustRules(i, 'dayStart', Number(e.target.value))}
                                    style={{ width: '100%', padding: '4px' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.8rem' }}>{t('endDay')}</label>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <input
                                        type="number"
                                        value={rule.dayEnd === 'END' ? 28 : rule.dayEnd}
                                        disabled={readOnly || rule.dayEnd === 'END'}
                                        onChange={e => adjustRules(i, 'dayEnd', Number(e.target.value))}
                                        step={getStepSizeForType(rule.type)} // Hint to browser for number input
                                        style={{ width: '100%', padding: '4px' }}
                                    />
                                    <button type="button" disabled={readOnly} onClick={() => toggleEnd(i)} style={{ fontSize: '0.7rem' }}>
                                        {rule.dayEnd === 'END' ? t('setHash') : t('end')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.8rem' }}>{t('type')}</label>
                            <select
                                value={rule.type}
                                disabled={readOnly}
                                onChange={e => updateRuleType(i, e.target.value)}
                                style={{ width: '100%', padding: '4px' }}
                            >
                                <optgroup label={t('builtIn')}>
                                    <option value="STANDARD">{t('standard')}</option>
                                    <option value="LIMIT_HOURS">{t('gentleLimit')}</option>
                                    <option value="NO_FASTING">{t('noFasting')}</option>
                                </optgroup>
                                {customFastingTypes.length > 0 && (
                                    <optgroup label={t('myCustomTypes')}>
                                        {customFastingTypes.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.windowDuration || 24}h)</option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>

                        {customFastingTypes.find(t => t.id === rule.type) && (
                            <div style={{ marginBottom: '8px', fontSize: '0.8rem', color: 'var(--c-text-muted)', background: '#f5f5f5', padding: '4px', borderRadius: '4px' }}>
                                ℹ️ {customFastingTypes.find(t => t.id === rule.type)?.description}
                                <br />
                                <span style={{ fontSize: '0.75rem' }}>{t('durationStep')}: {getStepSizeForType(rule.type)} {t('durationStepDays')}</span>
                            </div>
                        )}

                        {!readOnly && (
                            <button type="button" onClick={() => removeRule(i)} style={{ color: 'red', fontSize: '0.8rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                {t('removeRule')}
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
                        {t('addCyclePhaseRule')}
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <button type="button" onClick={onCancel} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #ccc', borderRadius: 'var(--radius-md)' }}>
                    {readOnly ? t('close') : t('cancel')}
                </button>
                {!readOnly && (
                    <button type="submit" style={{ flex: 1, padding: '10px', background: 'var(--c-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)' }}>
                        {t('savePlan')}
                    </button>
                )}
            </div>
        </form>
    );
};

export default PlanEditor;
