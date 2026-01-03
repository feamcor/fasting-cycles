import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { FastingTypeDef, FastingSlot } from '../types';
import { BUILT_IN_FASTING_TYPES } from '../data/fastingTypes';

const FastingTypeManager = () => {
    const { customFastingTypes = [], addFastingType, deleteFastingType } = useSettingsStore();
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [windowDuration, setWindowDuration] = useState(24);
    const [slots, setSlots] = useState<FastingSlot[]>([]);

    // Temp Slot State
    const [tempStartDay, setTempStartDay] = useState(0);
    const [tempStartTime, setTempStartTime] = useState('20:00');
    const [tempEndDay, setTempEndDay] = useState(1);
    const [tempEndTime, setTempEndTime] = useState('08:00'); // Default to Standard-ish

    const handleAddSlot = () => {
        const newSlot: FastingSlot = {
            // Store as "D:HH:mm" for Start and End.
            start: `${tempStartDay}:${tempStartTime}`,
            end: `${tempEndDay}:${tempEndTime}`,
            dayOffset: 0 // Unused in this logic but required by type? No, type says dayOffset is number. 
            // Check types/index.ts step 550: dayOffset is there.
        };
        // Wait, step 550 type def: start: string, end: string, dayOffset: number.
        // I should set dayOffset for consistency or remove it from type if unused.
        // I'll set it to 0 for now.
        setSlots([...slots, { ...newSlot, dayOffset: 0 }]);
    };

    const handleSave = () => {
        if (!name.trim()) return alert("Name required");
        if (slots.length === 0) return alert("Add at least one fasting slot");

        const newType: FastingTypeDef = {
            id: `type-${Date.now()}`,
            name,
            windowDuration,
            slots,
            isSystem: false,
            description: `${slots.length} slots over ${windowDuration}h`
        };
        addFastingType(newType);
        setIsCreating(false);
        setName('');
        setSlots([]);
        setWindowDuration(24);
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '??:??';
        const parts = timeStr.split(':');
        // Expect D:HH:mm
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
                    <button onClick={() => setIsCreating(true)} style={{ padding: '8px 12px', background: 'var(--c-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                        + New Type
                    </button>
                )}
            </div>

            {isCreating && (
                <div style={{ background: 'var(--c-bg-app)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', border: '1px solid #ddd' }}>
                    <h4 style={{ marginTop: 0 }}>Create Fasting Type</h4>

                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 'var(--radius-md)' }} placeholder="e.g. My 48h Cycle" />
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
                        <button onClick={handleSave} style={{ flex: 1, padding: '8px', background: 'var(--c-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setIsCreating(false)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid #ccc', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {[...BUILT_IN_FASTING_TYPES, ...customFastingTypes].map((type) => (
                    <div key={type.id} style={{
                        padding: '12px',
                        background: type.isSystem ? '#f9f9f9' : 'white',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #eee',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: 600 }}>{type.name} {type.isSystem && <span style={{ fontSize: '0.7em', border: '1px solid #ccc', padding: '0 4px', borderRadius: '2px' }}>SYSTEM</span>}</div>
                            {!type.isSystem && (
                                <button onClick={() => deleteFastingType(type.id)} style={{ color: 'red', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
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
