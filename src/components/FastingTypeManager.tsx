import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { FastingTypeDef } from '../types';

const BUILT_IN_TYPES = [
    { id: 'STANDARD', name: 'Standard (16:8)', fastingHours: 16, eatingHours: 8, isSystem: true, description: 'The classic Leangains method.' },
    { id: 'LIMIT_HOURS', name: 'Gentle Limit', fastingHours: 12, eatingHours: 12, isSystem: true, description: 'Good for beginners or gentle phases.' },
    { id: 'NO_FASTING', name: 'No Fasting', fastingHours: 0, eatingHours: 24, isSystem: true, description: 'Eat normally without restriction.' }
];

const FastingTypeManager = () => {
    const { customFastingTypes = [], addFastingType, deleteFastingType } = useSettingsStore();
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [fastingHours, setFastingHours] = useState(16);

    const handleSave = () => {
        if (!name.trim()) {
            alert("Please give your fasting type a name.");
            return;
        }
        const newType: FastingTypeDef = {
            id: `type-${Date.now()}`,
            name,
            fastingHours,
            eatingHours: 24 - fastingHours,
            isSystem: false,
            description: `${fastingHours}h Fasting / ${24 - fastingHours}h Eating`
        };
        addFastingType(newType);
        setIsCreating(false);
        setName('');
        setFastingHours(16);
    };

    return (
        <div style={{ marginTop: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <h3>Fasting Types</h3>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        style={{
                            padding: '8px 12px',
                            background: 'var(--c-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        + New Type
                    </button>
                )}
            </div>

            {isCreating && (
                <div style={{
                    background: 'var(--c-bg-app)',
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-md)',
                    border: '1px solid #ddd'
                }}>
                    <h4 style={{ marginTop: 0 }}>Create Fasting Type</h4>

                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Warrior Diet"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem' }}>Configuration</label>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--c-primary)' }}>
                                {fastingHours}h Fast / {24 - fastingHours}h Eat
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="23"
                            step="1"
                            value={fastingHours}
                            onChange={(e) => setFastingHours(Number(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--c-primary)' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--c-text-muted)', marginTop: '4px' }}>
                            <span>0h</span>
                            <span>12h</span>
                            <span>24h</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: 'var(--c-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer'
                            }}
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setIsCreating(false)}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: 'transparent',
                                border: '1px solid #ccc',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {customFastingTypes.map((type) => (
                    <div key={type.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: 'white',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid #eee'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>{type.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>
                                {type.fastingHours}h Fasting / {type.eatingHours}h Eating
                            </div>
                        </div>
                        <button
                            onClick={() => deleteFastingType(type.id)}
                            style={{
                                color: 'var(--c-text-muted)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                opacity: 0.6
                            }}
                            title="Delete Type"
                        >
                            &times;
                        </button>
                    </div>
                ))}

                {/* Built-in Types (Read Only) */}
                {BUILT_IN_TYPES.map((type) => (
                    <div key={type.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: '#f9f9f9', // Slightly different bg for system
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #eee'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--c-text-muted)' }}>{type.name} <span style={{ fontSize: '0.7em', textTransform: 'uppercase', border: '1px solid #ccc', borderRadius: '4px', padding: '2px 4px' }}>Built-in</span></div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>
                                {type.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FastingTypeManager;
