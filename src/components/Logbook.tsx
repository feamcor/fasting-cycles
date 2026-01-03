import { useSettingsStore } from '../store/useSettingsStore';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';

const Logbook = ({ onClose }: { onClose: () => void }) => {
    const { cycleHistory } = useSettingsStore();

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--c-surface)',
            zIndex: 100,
            padding: 'var(--space-lg)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-xl)',
                borderBottom: '1px solid #efefef', // Subtle separator
                paddingBottom: 'var(--space-md)'
            }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--c-text-main)' }}>Logbook</h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        fontSize: '1.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--c-text-muted)'
                    }}
                >
                    &times;
                </button>
            </header>

            <div style={{ flex: 1 }}>
                {cycleHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--c-text-muted)', marginTop: 'var(--space-xl)' }}>
                        <p>No history yet.</p>
                        <p style={{ fontSize: '0.9rem' }}>Your cycles and fasting plans will appear here.</p>
                    </div>
                ) : (
                    cycleHistory.map((entry, index) => {
                        const start = parseISO(entry.startDate);
                        const end = entry.endDate ? parseISO(entry.endDate) : null;
                        const duration = end ? differenceInCalendarDays(end, start) + 1 : null;

                        return (
                            <div key={index} style={{
                                background: '#fcfcfc',
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-md)',
                                borderLeft: `4px solid ${entry.endDate ? 'var(--c-primary)' : 'var(--c-accent)'}`,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                                    <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--c-text-main)' }}>
                                        {format(start, 'MMM d, yyyy')}
                                    </span>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        background: entry.endDate ? '#eee' : '#fff0f0',
                                        color: entry.endDate ? '#666' : 'red'
                                    }}>
                                        {entry.endDate ? 'Completed' : 'Ongoing'}
                                    </span>
                                </div>

                                <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: 'var(--space-xs)' }}>
                                    {entry.endDate ? `Ended: ${format(end!, 'MMM d, yyyy')}` : 'Currently active'}
                                </div>

                                {duration && (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)' }}>
                                        Period Duration: {duration} days
                                    </div>
                                )}

                                <div style={{
                                    marginTop: 'var(--space-sm)',
                                    paddingTop: 'var(--space-sm)',
                                    borderTop: '1px dashed #eee',
                                    fontSize: '0.85rem',
                                    color: '#777'
                                }}>
                                    <strong>Plan:</strong> {entry.planSnapshot?.name || 'Unknown Plan'}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Logbook;
