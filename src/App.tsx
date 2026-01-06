import { useState } from 'react';
import { useSettingsStore } from './store/useSettingsStore';
import { useTranslation } from './hooks/useTranslation';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Logbook from './components/Logbook';

import logo from './assets/logo.png';

function App() {
  const lastPeriodStart = useSettingsStore((state) => state.lastPeriodStart);
  const { t, language } = useTranslation();
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const toggleLanguage = () => {
    setLanguage(language === 'en_US' ? 'pt_BR' : 'en_US');
  };

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
        <img src={logo} alt="App Logo" style={{ width: '120px', height: '120px', marginBottom: 'var(--space-xs)' }} />
        <h1 style={{ color: 'var(--c-primary)', marginBottom: '0', fontSize: '1.75rem', lineHeight: 1 }}>
          {t('appTitle')}
        </h1>
        <p style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem', margin: 0 }}>
          {t('appSubtitle')}
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
            title={t('logbook')}
          >
            📖
          </button>

          <button
            onClick={toggleLanguage}
            style={{
              background: 'transparent',
              fontSize: '1.5rem',
              opacity: 0.8,
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-xs)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title={t('language')}
          >
            {language === 'en_US' ? '🇺🇸' : '🇧🇷'}
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
            title={t('settings')}
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
