import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { FastingTypeDef, FastingSlot } from '../types';
import { BUILT_IN_FASTING_TYPES } from '../data/fastingTypes';

const FastingTypeManager = () => {
    const { customFastingTypes = [], addFastingType, editFastingType, deleteFastingType } = useSettingsStore();

    // UI State
    const [isCreating, setIsCreating] = useState(false);
    const [editingTypeId, setEditingTypeId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [windowDuration, setWindowDuration] = useState(24);
    const [slots, setSlots] = useState<FastingSlot[]>([]);
    const [color, setColor] = useState('#4a90e2'); // Default Blue

    // Temp Slot State
    const [tempStartDay, setTempStartDay] = useState(0);
    const [tempStartTime, setTempStartTime] = useState('20:00');
    const [tempEndDay, setTempEndDay] = useState(1);
    const [tempEndTime, setTempEndTime] = useState('08:00');

    const startEditing = (type: FastingTypeDef) => {
        setName(type.name);
        setWindowDuration(type.windowDuration);
        setSlots(type.slots);
        setColor(type.color || '#4a90e2');
        setEditingTypeId(type.id);
        setIsCreating(true);
    };

    const resetForm = () => {
        setIsCreating(false);
        setEditingTypeId(null);
        setName('');
        setSlots([]);
        setWindowDuration(24);
        setColor('#4a90e2');
    };

    const handleAddSlot = () => {
        const newSlot: FastingSlot = {
            start: `${tempStartDay}:${tempStartTime}`,
            end: `${tempEndDay}:${tempEndTime}`,
            dayOffset: 0
        };
        setSlots([...slots, { ...newSlot, dayOffset: 0 }]);
    };

    const handleSave = () => {
        if (!name.trim()) return alert("Name required");
        if (slots.length === 0) return alert("Add at least one fasting slot");

        const typeData: FastingTypeDef = {
            id: editingTypeId || `type-${Date.now()}`,
            name,
            windowDuration,
            slots,
            color,
            isSystem: false,
            description: `${slots.length} slots over ${windowDuration}h`
        };

        if (editingTypeId) {
            editFastingType(typeData);
        } else {
            addFastingType(typeData);
        }

        resetForm();
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '??:??';
        const parts = timeStr.split(':');
        if (parts.length === 3) {
            const day = parseInt(parts[0]) + 1;
            return `Day ${day} ${parts[1]}:${parts[2]}`;
        }
        return timeStr;
    };

    return (
        <div style={{ marginTop: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <h3>Fasting Types</h3>
                {!isCreating && (
                    <button onClick={() => { resetForm(); setIsCreating(true); }} style={{ padding: '8px 12px', background: 'var(--c-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                        + New Type
                    </button>
                )}
            </div>

            {isCreating && (
                <div style={{ background: 'var(--c-bg-app)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', border: '1px solid #ddd' }}>
                    <h4 style={{ marginTop: 0 }}>{editingTypeId ? 'Edit Fasting Type' : 'Create Fasting Type'}</h4>

                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 'var(--radius-md)' }} placeholder="e.g. My 48h Cycle" />
                    </div>

                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Color (for Calendar)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '60px', height: '40px', padding: '0', border: 'none', cursor: 'pointer' }} />
                            <span style={{ fontSize: '0.9rem', color: '#666' }}>{color}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Window Duration (Hours)</label>
                        <input type="number" value={windowDuration} onChange={(e) => setWindowDuration(Number(e.target.value))} style={{ width: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} min="12" step="12" />
                    </div>

                    <div style={{ marginBottom: 'var(--space-md)', background: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #eee' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Add Fasting Slot</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', display: 'block' }}>Start Day</label>
                                <select value={tempStartDay} onChange={e => setTempStartDay(Number(e.target.value))} style={{ padding: '4px' }}>
                                    {[...Array(Math.ceil(windowDuration / 24))].map((_, i) => <option key={i} value={i}>Day {i + 1}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', display: 'block' }}>Start Time</label>
                                <input type="time" value={tempStartTime} onChange={e => setTempStartTime(e.target.value)} style={{ padding: '4px' }} />
                            </div>
                            <span style={{ paddingBottom: '6px' }}>to</span>
                            <div>
                                <label style={{ fontSize: '0.8rem', display: 'block' }}>End Day</label>
                                <select value={tempEndDay} onChange={e => setTempEndDay(Number(e.target.value))} style={{ padding: '4px' }}>
                                    {[...Array(Math.ceil(windowDuration / 24) + 1)].map((_, i) => <option key={i} value={i}>Day {i + 1}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', display: 'block' }}>End Time</label>
                                <input type="time" value={tempEndTime} onChange={e => setTempEndTime(e.target.value)} style={{ padding: '4px' }} />
                            </div>
                            <button type="button" onClick={handleAddSlot} style={{ background: '#eee', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}>Add</button>
                        </div>
                    </div>

                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <h5>Defined Slots:</h5>
                        {slots.length === 0 && <span style={{ color: '#999', fontSize: '0.9rem' }}>No slots added.</span>}
                        {slots.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', marginBottom: '4px', alignItems: 'center' }}>
                                <span>{formatTime(s.start)}  ➝  {formatTime(s.end)}</span>
                                <button type="button" onClick={() => setSlots(slots.filter((_, idx) => idx !== i))} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleSave} style={{ flex: 1, padding: '8px', background: 'var(--c-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                            {editingTypeId ? 'Save Changes' : 'Create Type'}
                        </button>
                        <button onClick={resetForm} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid #ccc', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {[...BUILT_IN_FASTING_TYPES, ...customFastingTypes].map((type) => (
                    <div key={type.id} style={{
                        padding: '12px',
                        background: type.isSystem ? '#f9f9f9' : 'white',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `4px solid ${type.color || 'transparent'}`,
                        borderTop: '1px solid #eee',
                        borderRight: '1px solid #eee',
                        borderBottom: '1px solid #eee',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {type.name}
                                {type.isSystem && <span style={{ fontSize: '0.7em', border: '1px solid #ccc', padding: '0 4px', borderRadius: '2px' }}>SYSTEM</span>}
                            </div>
                            {!type.isSystem && (
                                <div>
                                    <button onClick={() => startEditing(type)} style={{ color: 'var(--c-primary)', background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '8px', textDecoration: 'underline' }}>Edit</button>
                                    <button onClick={() => deleteFastingType(type.id)} style={{ color: 'red', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', marginTop: '4px' }}>
                            Window: {type.windowDuration || 24}h
                        </div>
                        <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                            {type.slots?.map((s, i) => (
                                <div key={i}>Fasting: {formatTime(s.start)} - {formatTime(s.end)}</div>
                            ))}
                            {(!type.slots || type.slots.length === 0) && <div style={{ fontStyle: 'italic', color: '#888' }}>No scheduled fasting (Eat anytime)</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FastingTypeManager;
