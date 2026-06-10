import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Vibration } from 'react-native';
import { Audio } from 'expo-av';
import { Task, TaskCategory, TaskPriority, TaskStatus, FilterType } from '@/constants/data';
import { useTasks, ActivityLog } from '@/hooks/use-tasks';
import { useStats, TaskStats } from '@/hooks/use-stats';
import { useSettings, AppSettings } from '@/hooks/use-settings';
import { translations, TranslationKey } from '@/constants/translations';

interface AppContextType {
  // Tasks
  tasks: Task[];
  allTasks: Task[];
  activeFilter: FilterType;
  searchQuery: string;
  sortBy: 'newest' | 'oldest' | 'priority';
  createdCount: number;
  completedCount: number;
  deletedCount: number;
  activityLog: ActivityLog[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  toggleStatus: (id: string) => void;
  setFilter: (filter: FilterType) => void;
  setSearch: (query: string) => void;
  setSort: (sort: 'newest' | 'oldest' | 'priority') => void;
  getTaskById: (id: string) => Task | undefined;

  // Stats
  stats: TaskStats;

  // Settings
  settings: AppSettings;
  toggleDarkMode: () => void;
  toggleFluidAnimations: () => void;
  setWorkHours: (start: string, end: string) => void;
  setLanguage: (lang: 'en' | 'vi') => void;
  updateProfile: (name: string, role: string, avatar: string) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;

  // Focus Timer
  activeFocusTask: Task | null;
  focusSecondsRemaining: number;
  isFocusTimerActive: boolean;
  isFocusTimerStarted: boolean;
  isFocusTimerCompleted: boolean;
  showFocusTimerModal: boolean;
  startFocusTimer: (task: Task, seconds: number) => void;
  pauseFocusTimer: () => void;
  resumeFocusTimer: () => void;
  stopFocusTimer: () => void;
  completeFocusTask: () => void;
  setShowFocusTimerModal: (show: boolean) => void;
  setFocusSecondsRemaining: React.Dispatch<React.SetStateAction<number>>;
  setActiveFocusTask: React.Dispatch<React.SetStateAction<Task | null>>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const taskManager = useTasks();
  const stats = useStats(taskManager.allTasks);
  const { settings, toggleDarkMode, toggleFluidAnimations, setWorkHours, setLanguage, updateProfile } = useSettings();

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>) => {
    const lang = settings.language || 'en';
    let text = translations[lang]?.[key] || translations['en']?.[key] || key;
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return text;
  }, [settings.language]);

  // Global Focus Timer state
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);
  const [focusSecondsRemaining, setFocusSecondsRemaining] = useState(0);
  const [isFocusTimerActive, setIsFocusTimerActive] = useState(false);
  const [isFocusTimerStarted, setIsFocusTimerStarted] = useState(false);
  const [isFocusTimerCompleted, setIsFocusTimerCompleted] = useState(false);
  const [showFocusTimerModal, setShowFocusTimerModal] = useState(false);

  const playAlarmSound = async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/1006/1006-84.wav' }
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing alarm sound:', error);
    }
  };

  // Global Countdown Logic
  useEffect(() => {
    let interval: any = null;
    if (isFocusTimerActive && focusSecondsRemaining > 0) {
      interval = setInterval(() => {
        setFocusSecondsRemaining((sec) => sec - 1);
      }, 1000);
    } else if (focusSecondsRemaining === 0 && isFocusTimerActive) {
      setIsFocusTimerActive(false);
      setIsFocusTimerCompleted(true);
      Vibration.vibrate([0, 500, 200, 500]); // Vibrate pattern on completion
      playAlarmSound();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusTimerActive, focusSecondsRemaining]);

  const startFocusTimer = (task: Task, seconds: number) => {
    setActiveFocusTask(task);
    setFocusSecondsRemaining(seconds);
    setIsFocusTimerStarted(true);
    setIsFocusTimerActive(true);
    setIsFocusTimerCompleted(false);
  };

  const pauseFocusTimer = () => {
    setIsFocusTimerActive(false);
  };

  const resumeFocusTimer = () => {
    setIsFocusTimerActive(true);
  };

  const stopFocusTimer = () => {
    setIsFocusTimerActive(false);
    setIsFocusTimerStarted(false);
    setIsFocusTimerCompleted(false);
    setActiveFocusTask(null);
  };

  const completeFocusTask = () => {
    if (activeFocusTask) {
      taskManager.updateTask(activeFocusTask.id, { status: 'DONE' });
    }
    stopFocusTimer();
  };

  return (
    <AppContext.Provider
      value={{
        ...taskManager,
        stats,
        settings,
        toggleDarkMode,
        toggleFluidAnimations,
        setWorkHours,
        setLanguage,
        updateProfile,
        t,
        activeFocusTask,
        focusSecondsRemaining,
        isFocusTimerActive,
        isFocusTimerStarted,
        isFocusTimerCompleted,
        showFocusTimerModal,
        startFocusTimer,
        pauseFocusTimer,
        resumeFocusTimer,
        stopFocusTimer,
        completeFocusTask,
        setShowFocusTimerModal,
        setFocusSecondsRemaining,
        setActiveFocusTask,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}