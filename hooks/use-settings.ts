import { useState, useCallback } from 'react';

export interface AppSettings {
  darkMode: boolean;
  fluidAnimations: boolean;
  workHourStart: string;
  workHourEnd: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  fluidAnimations: true,
  workHourStart: '9:00 AM',
  workHourEnd: '6:00 PM',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const toggleDarkMode = useCallback(() => {
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const toggleFluidAnimations = useCallback(() => {
    setSettings((prev) => ({ ...prev, fluidAnimations: !prev.fluidAnimations }));
  }, []);

  const setWorkHours = useCallback((start: string, end: string) => {
    setSettings((prev) => ({ ...prev, workHourStart: start, workHourEnd: end }));
  }, []);

  return {
    settings,
    toggleDarkMode,
    toggleFluidAnimations,
    setWorkHours,
  };
}