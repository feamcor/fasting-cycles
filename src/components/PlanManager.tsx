import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslation } from '../hooks/useTranslation';
import { DEFAULT_PLANS } from '../data/defaultPlans';
import PlanEditor from './PlanEditor';
import type { Plan } from '../types';

const PlanManager = () => {
    const { selectedPlanId, setSelectedPlanId, customPlans, addPlan, updatePlan, deletePlan } = useSettingsStore();
    const { t } = useTranslation();
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Combine default and custom plans
    const allPlans = [...DEFAULT_PLANS, ...(customPlans || [])];

    const handleSave = (plan: Plan) => {
        if (isCreating) {
            addPlan(plan);
        } else {
            updatePlan(plan);
        }
        setEditingPlan(null);
        setIsCreating(false);
    };

    if (editingPlan || isCreating) {
        return (
            <div>
                <h3 style={{ marginBottom: '16px' }}>{isCreating ? t('createNewPlan') : (DEFAULT_PLANS.some(p => p.id === editingPlan?.id) ? t('viewPlan') : t('editPlan'))}</h3>
                <PlanEditor
                    initialPlan={editingPlan || undefined}
                    onSave={handleSave}
                    onCancel={() => { setEditingPlan(null); setIsCreating(false); }}
                    readOnly={DEFAULT_PLANS.some(p => p.id === editingPlan?.id)}
                />
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--c-text-muted)', margin: 0 }}>{t('fastingPlans')}</h3>
                <button
                    onClick={() => setIsCreating(true)}
                    style={{ padding: '8px 12px', background: 'var(--c-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                >
                    {t('new')}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {allPlans.map(plan => {
                    const isDefault = DEFAULT_PLANS.some(p => p.id === plan.id);
                    const isSelected = selectedPlanId === plan.id;

                    return (
                        <div key={plan.id} style={{
                            background: isSelected ? 'var(--c-surface)' : 'transparent',
                            border: `1px solid ${isSelected ? 'var(--c-primary)' : '#eee'}`,
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            position: 'relative'
                        }}>
                            <div
                                onClick={() => setSelectedPlanId(plan.id)}
                                style={{ cursor: 'pointer', paddingRight: '40px' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 600 }}>
                                        {plan.id === 'hormonal-harmony' ? t('planHormonalHarmony') : plan.name}
                                    </span>
                                    {isSelected && <span style={{ fontSize: '0.7rem', background: 'var(--c-primary)', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>{t('active')}</span>}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', margin: '4px 0 0' }}>
                                    {plan.id === 'hormonal-harmony' ? t('descHormonalHarmony') : plan.description}
                                </p>
                            </div>

                            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                                {!isDefault && (
                                    <>
                                        <button onClick={() => setEditingPlan(plan)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--c-primary)', textDecoration: 'underline' }}>{t('edit')}</button>
                                        <button onClick={() => {
                                            if (confirm(t('deletePlanConfirm'))) deletePlan(plan.id);
                                        }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'red' }}>×</button>
                                    </>
                                )}
                                {isDefault && (
                                    <button onClick={() => setEditingPlan(plan)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--c-text-muted)' }}>
                                        {t('viewPlan')}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PlanManager;
