import React, { useEffect } from 'react';
import { AppRouter } from './router';
import { useAuthStore } from './store/authStore';
import { useSettingsStore } from './store/settingsStore';

export const App: React.FC = () => {
  const { init } = useAuthStore();
  const { fetchSettings } = useSettingsStore();

  useEffect(() => {
    init();
    fetchSettings();
  }, [init, fetchSettings]);

  return <AppRouter />;
};

export default App;

