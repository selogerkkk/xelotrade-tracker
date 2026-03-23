import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Settings } from '../types';

const defaultSettings: Settings = {
  payout: 82,
  galeMultiplier: 2.2,
  valorInicial: 100,
  valorOperacao: 5,
  alertWinrate: 75,
  alertEnabled: true,
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
