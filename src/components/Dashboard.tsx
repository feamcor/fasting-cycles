import { useCycleCalculator } from '../hooks/useCycleCalculator';
import { useSettingsStore } from '../store/useSettingsStore';
import Calendar from './Calendar';


const Dashboard = () => {
    const status = useCycleCalculator();
    const {
        fastingWindowStart,
        fastingWindowEnd
    } = useSettingsStore();

    if (!status) return null;

    const { currentCycleDay, activeRule, planName } = status;

    // Determine advice based on rule
    const getAdvice = () => {
        if (!activeRule) return { title: 'Rest', text: 'No specific rule for today.' };

        switch (activeRule.type) {
            case 'NO_FASTING':
                return {
                    title: 'Nourish',
                    text: 'Focus on nutrient-dense foods. No fasting recommended.'
                };
            case 'LIMIT_HOURS':
                return {
                    title: 'Gentle Fast',
                    text: `Limit fasting to ${activeRule.allowedHours} hours max to support ovulation.`
                };
            case 'STANDARD':
                return {
                    title: 'Power Fast',
                    text: `Standard fasting window: Stop eating at ${fastingWindowStart}, Start at ${fastingWindowEnd}.`
                };
            default:
                return { title: 'Flow', text: activeRule.description || '' };
        }
    };

    const advice = getAdvice();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Cycle Card */}
            <div style={{
                background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%)',
                padding: 'var(--space-xl) var(--space-lg)',
                borderRadius: 'var(--radius-lg)',
                color: 'white',
                textAlign: 'center',
                boxShadow: 'var(--shadow-float)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{ opacity: 0.9, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Day {currentCycleDay}
                    </h3>
                    <div style={{ fontSize: '3rem', fontWeight: 800, margin: 'var(--space-xs) 0' }}>
                        {advice.title}
                    </div>
                    <p style={{ opacity: 0.9 }}>
                        {planName}
                    </p>
                </div>
            </div>

            {/* Advice Card */}
            <div style={{
                background: 'var(--c-surface)',
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)'
            }}>
                <h4 style={{ color: 'var(--c-text-muted)', marginBottom: 'var(--space-sm)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    Today's Guidance
                </h4>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{advice.text}</p>
                {activeRule?.description && (
                    <p style={{ marginTop: 'var(--space-md)', fontSize: '0.95rem', color: 'var(--c-text-muted)', fontStyle: 'italic' }}>
                        "{activeRule.description}"
                    </p>
                )}
            </div>

            <Calendar />



        </div>
    );
};

export default Dashboard;
