import { createContext, useContext, type ReactNode } from 'react';
import { Task, TaskCategory, TaskPriority, TaskStatus, FilterType } from '@/constants/data';
import { useTasks, ActivityLog } from '@/hooks/use-tasks';
import { useStats, TaskStats } from '@/hooks/use-stats';
import { useSettings, AppSettings } from '@/hooks/use-settings';

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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const taskManager = useTasks();
  const stats = useStats(taskManager.allTasks);
  const { settings, toggleDarkMode, toggleFluidAnimations, setWorkHours } = useSettings();

  return (
    <AppContext.Provider
      value={{
        ...taskManager,
        stats,
        settings,
        toggleDarkMode,
        toggleFluidAnimations,
        setWorkHours,
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