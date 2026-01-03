import { useState } from 'react';
import { useSettingsStore } from './store/useSettingsStore';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Logbook from './components/Logbook';

function App() {
  const lastPeriodStart = useSettingsStore((state) => state.lastPeriodStart);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogbook, setShowLogbook] = useState(false);

  return (
    <div style={{ padding: 'var(--space-md)', maxWidth: '600px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showLogbook && <Logbook onClose={() => setShowLogbook(false)} />}

      <header style={{
        marginBottom: 'var(--space-lg)',
        paddingTop: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--space-xs)'
      }}>
        <h1 style={{ color: 'var(--c-primary)', marginBottom: '0', fontSize: '1.75rem', lineHeight: 1 }}>
          Fasting Cycles
        </h1>
        <p style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Sync your fasting with your rhythm
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
          <button
            onClick={() => setShowLogbook(true)}
            style={{
              background: 'transparent',
              fontSize: '1.5rem',
              opacity: 0.8,
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-xs)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Logbook"
          >
            📖
          </button>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: 'transparent',
              fontSize: '1.5rem',
              opacity: 0.8,
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-xs)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      <main style={{ flex: 1, paddingBottom: 'var(--space-xl)' }}>
        {!lastPeriodStart ? <Onboarding /> : <Dashboard />}
      </main>
    </div>
  )
}

export default App
