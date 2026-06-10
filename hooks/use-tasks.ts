import { useReducer, useCallback, useMemo } from 'react';
import { Task, TaskPriority, TaskCategory, TaskStatus, TaskRepeat, FilterType, initialTasks, generateId } from '@/constants/data';

export interface ActivityLog {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'COMPLETE' | 'DELETE';
  taskTitle: string;
  timestamp: string;
}

type TaskAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Omit<Task, 'id' | 'createdAt'>> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_STATUS'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_FILTER'; payload: FilterType }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SORT'; payload: 'newest' | 'oldest' | 'priority' };

interface TaskState {
  tasks: Task[];
  activeFilter: FilterType;
  searchQuery: string;
  sortBy: 'newest' | 'oldest' | 'priority';
  createdCount: number;
  completedCount: number;
  deletedCount: number;
  activityLog: ActivityLog[];
}

function calculateNextDueDate(currentDateStr: string, repeat: TaskRepeat): Date {
  const date = new Date(currentDateStr);
  if (isNaN(date.getTime())) return new Date(Date.now() + 24 * 60 * 60 * 1000);

  switch (repeat) {
    case 'DAILY':
      date.setDate(date.getDate() + 1);
      break;
    case 'WEEKLY':
      date.setDate(date.getDate() + 7);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      break;
  }
  return date;
}

const priorityOrder: Record<TaskPriority, number> = { HIGH: 1, MED: 2, LOW: 3 };
const statusOrder: Record<TaskStatus, number> = { 'IN PROGRESS': 1, TODO: 2, DONE: 3 };

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      const newLog: ActivityLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        type: 'CREATE',
        taskTitle: newTask.title,
        timestamp: new Date().toISOString(),
      };
      return { 
        ...state, 
        tasks: [newTask, ...state.tasks],
        createdCount: state.createdCount + 1,
        activityLog: [newLog, ...state.activityLog],
      };
    }
    case 'UPDATE_TASK': {
      const { id, updates } = action.payload;
      let completedInc = 0;
      let extraTasks: Task[] = [];
      const oldTask = state.tasks.find((t) => t.id === id);
      if (!oldTask) return state;

      const wasCompleted = oldTask.status === 'DONE';
      const isCompleted = updates.status === 'DONE';
      if (!wasCompleted && isCompleted) {
        completedInc = 1;
      }

      const logType = (!wasCompleted && isCompleted) ? 'COMPLETE' : 'UPDATE';
      const newLog: ActivityLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        type: logType,
        taskTitle: oldTask.title,
        timestamp: new Date().toISOString(),
      };

      const finalRepeat = updates.repeat !== undefined ? updates.repeat : oldTask.repeat;
      const finalDueDate = updates.dueDate !== undefined ? updates.dueDate : oldTask.dueDate;
      if (!wasCompleted && isCompleted && finalRepeat && finalRepeat !== 'NONE') {
        const nextDueDate = calculateNextDueDate(finalDueDate, finalRepeat);
        const clonedTask: Task = {
          id: generateId(),
          title: updates.title !== undefined ? updates.title : oldTask.title,
          description: updates.description !== undefined ? updates.description : oldTask.description,
          category: updates.category !== undefined ? updates.category : oldTask.category,
          priority: updates.priority !== undefined ? updates.priority : oldTask.priority,
          dueDate: nextDueDate.toISOString(),
          status: 'TODO',
          createdAt: new Date().toISOString(),
          repeat: finalRepeat,
        };
        extraTasks.push(clonedTask);
      }

      const updatedTasks = state.tasks.map((t) => {
        if (t.id === id) {
          return { ...t, ...updates };
        }
        return t;
      });

      return { 
        ...state, 
        tasks: extraTasks.length > 0 ? [...extraTasks, ...updatedTasks] : updatedTasks,
        completedCount: state.completedCount + completedInc,
        activityLog: [newLog, ...state.activityLog],
      };
    }
    case 'DELETE_TASK': {
      const targetTask = state.tasks.find((t) => t.id === action.payload);
      if (!targetTask) return state;
      const newLog: ActivityLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        type: 'DELETE',
        taskTitle: targetTask.title,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
        deletedCount: state.deletedCount + 1,
        activityLog: [newLog, ...state.activityLog],
      };
    }
    case 'TOGGLE_STATUS': {
      let completedInc = 0;
      let newLog: ActivityLog | null = null;
      let extraTasks: Task[] = [];
      const updatedTasks = state.tasks.map((t) => {
        if (t.id !== action.payload) return t;
        const nextStatus: TaskStatus =
          t.status === 'TODO' ? 'IN PROGRESS' :
          t.status === 'IN PROGRESS' ? 'DONE' : 'TODO';
        if (nextStatus === 'DONE') {
          completedInc = 1;
        }

        const logType = nextStatus === 'DONE' ? 'COMPLETE' : 'UPDATE';
        newLog = {
          id: `log-${Date.now()}-${Math.random()}`,
          type: logType,
          taskTitle: t.title,
          timestamp: new Date().toISOString(),
        };

        if (nextStatus === 'DONE' && t.repeat && t.repeat !== 'NONE') {
          const nextDueDate = calculateNextDueDate(t.dueDate, t.repeat);
          const clonedTask: Task = {
            id: generateId(),
            title: t.title,
            description: t.description,
            category: t.category,
            priority: t.priority,
            dueDate: nextDueDate.toISOString(),
            status: 'TODO',
            createdAt: new Date().toISOString(),
            repeat: t.repeat,
          };
          extraTasks.push(clonedTask);
        }

        return { ...t, status: nextStatus };
      });
      return { 
        ...state, 
        tasks: extraTasks.length > 0 ? [...extraTasks, ...updatedTasks] : updatedTasks,
        completedCount: state.completedCount + completedInc,
        activityLog: newLog ? [newLog, ...state.activityLog] : state.activityLog,
      };
    }
    case 'SET_FILTER': {
      return { ...state, activeFilter: action.payload };
    }
    case 'SET_SEARCH': {
      return { ...state, searchQuery: action.payload };
    }
    case 'SET_SORT': {
      return { ...state, sortBy: action.payload };
    }
    default:
      return state;
  }
}

export function useTasks() {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: initialTasks,
    activeFilter: 'All' as FilterType,
    searchQuery: '',
    sortBy: 'newest' as const,
    createdCount: initialTasks.length,
    completedCount: initialTasks.filter(t => t.status === 'DONE').length,
    deletedCount: 0,
    activityLog: [
      {
        id: 'log-init-1',
        type: 'COMPLETE',
        taskTitle: 'Team Standup Notes',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'log-init-2',
        type: 'CREATE',
        taskTitle: 'Q4 Strategy Deck',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'log-init-3',
        type: 'CREATE',
        taskTitle: 'Advanced UI Patterns',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ] as ActivityLog[],
  });

  const addTask = useCallback(
    (task: Omit<Task, 'id' | 'createdAt'>) => {
      dispatch({ type: 'ADD_TASK', payload: task });
    },
    []
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    },
    []
  );

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const toggleStatus = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: id });
  }, []);

  const setFilter = useCallback((filter: FilterType) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const setSearch = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  }, []);

  const setSort = useCallback((sort: 'newest' | 'oldest' | 'priority') => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }, []);

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...state.tasks];

    // Filter by search
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Filter by filter type
    switch (state.activeFilter) {
      case 'High':
        result = result.filter((t) => t.priority === 'HIGH');
        break;
      case 'Study':
        result = result.filter((t) => t.category === 'STUDY');
        break;
      case 'Work':
        result = result.filter((t) => t.category === 'WORK');
        break;
      case 'Personal':
        result = result.filter((t) => t.category === 'PERSONAL');
        break;
      case 'All':
      default:
        break;
    }

    // Sort
    result.sort((a, b) => {
      switch (state.sortBy) {
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [state.tasks, state.activeFilter, state.searchQuery, state.sortBy]);

  const getTaskById = useCallback(
    (id: string) => state.tasks.find((t) => t.id === id),
    [state.tasks]
  );

  const activeFilter = state.activeFilter;
  const searchQuery = state.searchQuery;
  const sortBy = state.sortBy;
  const allTasks = state.tasks;
  const createdCount = state.createdCount;
  const completedCount = state.completedCount;
  const deletedCount = state.deletedCount;
  const activityLog = state.activityLog;

  return {
    tasks: filteredAndSortedTasks,
    allTasks,
    activeFilter,
    searchQuery,
    sortBy,
    createdCount,
    completedCount,
    deletedCount,
    activityLog,
    addTask,
    updateTask,
    deleteTask,
    toggleStatus,
    setFilter,
    setSearch,
    setSort,
    getTaskById,
  };
}