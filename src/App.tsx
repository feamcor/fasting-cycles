import { useState } from 'react';
import { useSettingsStore } from './store/useSettingsStore';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';

function App() {
  const lastPeriodStart = useSettingsStore((state) => state.lastPeriodStart);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div style={{ padding: 'var(--space-md)', maxWidth: '600px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      <header style={{ marginBottom: 'var(--space-lg)', textAlign: 'center', paddingTop: 'var(--space-lg)', position: 'relative' }}>
        <button
          onClick={() => setShowSettings(true)}
          style={{
            position: 'absolute',
            right: 0,
            top: 'var(--space-lg)',
            background: 'transparent',
            fontSize: '1.5rem',
            opacity: 0.7
          }}
        >
          ⚙️
        </button>
        <h1 style={{ color: 'var(--c-primary)', marginBottom: 'var(--space-xs)', fontSize: '1.75rem' }}>
          Fasting Cycles
        </h1>
        <p style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem' }}>
          Sync your fasting with your rhythm
        </p>
      </header>

      <main style={{ flex: 1, paddingBottom: 'var(--space-xl)' }}>
        {!lastPeriodStart ? <Onboarding /> : <Dashboard />}
      </main>
    </div>
  )
}

export default App
