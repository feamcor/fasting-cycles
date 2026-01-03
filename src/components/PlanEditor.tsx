import { useState } from 'react';
import type { Plan, FastingRule } from '../types';
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
            const ends = newRules.map(r => (r.dayEnd === 'END' ? 28 : r.dayEnd));
            const step = getStepSizeForType(newRules[targetBoundaryIndex].type);
            const startOfTarget = newRules[targetBoundaryIndex].dayStart;

            // Apply Snap Logic to Target
            let requestedDuration = value - startOfTarget + 1;
            if (requestedDuration < step) requestedDuration = step;
            // Snap to nearest multiple
            requestedDuration = Math.round(requestedDuration / step) * step;

            let newEnd = startOfTarget + requestedDuration - 1;

            ends[targetBoundaryIndex] = newEnd;

            // Validation Propagation
            // 1. Right Ripple
            for (let i = targetBoundaryIndex; i < ends.length - 1; i++) {
                // If overlap
                if (ends[i + 1] <= ends[i]) {
                    // Push next end to maintain its step?
                    const nextTypeStep = getStepSizeForType(newRules[i + 1].type);
                    // Start of next is ends[i] + 1.
                    // Min end of next is Start + Step - 1
                    // ends[i+1] must be >= ends[i] + 1 + nextTypeStep - 1
                    // => ends[i+1] >= ends[i] + nextTypeStep

                    // Current len
                    // we want to preserve length if possible, or push?
                    // Let's just push Start => pushes End.
                    // But we only store ends array here.
                    // Assuming constant length? No, usually ripple compresses or pushes.
                    // Let's ensure minimal valid end.
                    ends[i + 1] = ends[i] + nextTypeStep;
                }
            }

            // 2. Left Ripple (if pushed back)
            for (let i = targetBoundaryIndex; i > 0; i--) {
                if (ends[i - 1] >= ends[i]) {
                    // Need to shrink prev
                    const prevStep = getStepSizeForType(newRules[i - 1].type);
                    // ends[i-1] must be < ends[i]
                    // max valid end for prev is ends[i] - 1 ? 
                    // Wait, start of i is ends[i-1] + 1.
                    // So ends[i] >= ends[i-1] + 1 + stepOfI - 1 = ends[i-1] + stepOfI.
                    // So ends[i-1] <= ends[i] - stepOfI.

                    // But here we are adjusting i-1 based on i.
                    // Actually, if we dragged i end to left, we might crush i.
                    // logic: ends[i-1] must be <= ends[i] - stepOfI.
                    // But wait, stepOfI is property of rule i.
                    const stepOfCurrent = getStepSizeForType(newRules[i].type);

                    let maxPrevEnd = ends[i] - stepOfCurrent;
                    // Also snap maxPrevEnd to prev's step logic?
                    // This gets complicated. Let's rely on normalizeRules mostly?
                    // But we want smooth dragging. 

                    // Simple push back:
                    ends[i - 1] = ends[i] - 1; // Raw push
                }
            }

            // Re-apply full normalization to handle complex ripple/step constraints safely
            // We reconstruct the rules with the proposed changes and run normalize.
            // But we need to update the state temporarily to run normalize.

            // Let's just trust normalizeRules to fix specifics if we set the main boundary.
            // We constructed 'ends'. Let's map back to rules and normalize.
            let currentStart = 1;
            for (let i = 0; i < newRules.length; i++) {
                newRules[i].dayStart = currentStart;
                newRules[i].dayEnd = ends[i];
                currentStart = ends[i] + 1;
            }
            const normalized = normalizeRules(newRules);
            setRules(normalized);
            return;
        }

        // Fallback (should not happen for valid moves)
        setRules(newRules);
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
        if (start > 28) {
            if (rules.length > 0) {
                // Try to squeeze
                const newRules = [...rules];
                const lastIdx = newRules.length - 1;
                const lastTypeStep = getStepSizeForType(newRules[lastIdx].type);

                let lastEnd = newRules[lastIdx].dayEnd === 'END' ? 28 : newRules[lastIdx].dayEnd;

                // Can we shrink last rule by its step?
                // Current Duration
                const curDur = lastEnd - newRules[lastIdx].dayStart + 1;
                if (curDur > lastTypeStep) {
                    newRules[lastIdx].dayEnd = lastEnd - lastTypeStep; // Shrink by one unit
                    start = newRules[lastIdx].dayEnd + 1;
                } else {
                    return; // Cannot add
                }

                const newRule: FastingRule = {
                    dayStart: start,
                    dayEnd: start,
                    type: 'STANDARD',
                    description: ''
                };
                setRules(normalizeRules([...newRules, newRule]));
                return;
            }
        } else {
            const newRule: FastingRule = {
                dayStart: start,
                dayEnd: Math.min(start + 4, 28),
                type: 'STANDARD',
                description: ''
            };
            setRules(normalizeRules([...rules, newRule]));
        }
    };

    const removeRule = (index: number) => {
        const newRules = rules.filter((_, i) => i !== index);
        setRules(normalizeRules(newRules));
    };

    const toggleEnd = (index: number) => {
        const newRules = [...rules];
        if (newRules[index].dayEnd === 'END') {
            newRules[index].dayEnd = 28;
        } else {
            newRules[index].dayEnd = 'END';
        }
        setRules(normalizeRules(newRules));
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
                                        step={getStepSizeForType(rule.type)} // Hint to browser
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
