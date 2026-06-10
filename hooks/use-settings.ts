import { useState, useCallback } from 'react';

export interface AppSettings {
  darkMode: boolean;
  fluidAnimations: boolean;
  workHourStart: string;
  workHourEnd: string;
  language: 'en' | 'vi';
  profileName: string;
  profileRole: string;
  profileAvatar: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  fluidAnimations: true,
  workHourStart: '9:00 AM',
  workHourEnd: '6:00 PM',
  language: 'en',
  profileName: 'Nam',
  profileRole: 'Creative Lead',
  profileAvatar: '',
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

  const setLanguage = useCallback((language: 'en' | 'vi') => {
    setSettings((prev) => ({ ...prev, language }));
  }, []);

  const updateProfile = useCallback((name: string, role: string, avatar: string) => {
    setSettings((prev) => ({ ...prev, profileName: name, profileRole: role, profileAvatar: avatar }));
  }, []);

  return {
    settings,
    toggleDarkMode,
    toggleFluidAnimations,
    setWorkHours,
    setLanguage,
    updateProfile,
  };
}