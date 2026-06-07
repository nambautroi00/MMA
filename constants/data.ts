export type TaskPriority = 'HIGH' | 'MED' | 'LOW';
export type TaskCategory = 'WORK' | 'STUDY' | 'PERSONAL';
export type TaskStatus = 'TODO' | 'IN PROGRESS' | 'REVIEW' | 'DONE';
export type FilterType = 'All' | 'Completed' | 'Pending' | 'High' | 'Study' | 'Work' | 'Personal';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string; // ISO date string
  status: TaskStatus;
  createdAt: string;
}

export interface Activity {
  title: string;
  time: string;
  icon: string;
}

let taskCounter = 0;

export function generateId(): string {
  taskCounter++;
  return `task-${Date.now()}-${taskCounter}`;
}

export const initialTasks: Task[] = [
  {
    id: generateId(),
    title: 'Q4 Strategy Deck',
    description: 'Finalize the visual storytelling components for the upcoming quarterly board meeting and investor presentation.',
    category: 'WORK',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'IN PROGRESS',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Advanced UI Patterns',
    description: 'Complete the research module on micro-interactions and spatial layout systems for modern mobile interfaces.',
    category: 'STUDY',
    priority: 'MED',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'TODO',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Team Standup Notes',
    description: 'Review and organize notes from the daily standup meeting with the engineering team.',
    category: 'WORK',
    priority: 'LOW',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'DONE',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: generateId(),
    title: 'Math Final Preparation',
    description: 'Review calculus and linear algebra chapters for the upcoming final exam next week.',
    category: 'STUDY',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'TODO',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Design System Overhaul',
    description: 'Update component library with new color tokens and typography scale for consistency.',
    category: 'WORK',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'IN PROGRESS',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: generateId(),
    title: 'Weekly Grocery Shopping',
    description: 'Plan and organize the weekly grocery list including fresh produce and pantry items.',
    category: 'PERSONAL',
    priority: 'LOW',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'TODO',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'React Native Performance',
    description: 'Research and document best practices for optimizing FlatList and image loading performance.',
    category: 'STUDY',
    priority: 'MED',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'DONE',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `${date.toLocaleDateString('en-US', { weekday: 'short' })}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getFilterLabel = (task: Task): FilterType[] => {
  const labels: FilterType[] = ['All'];
  if (task.status === 'DONE') labels.push('Completed');
  if (task.status === 'TODO' || task.status === 'IN PROGRESS') labels.push('Pending');
  if (task.priority === 'HIGH') labels.push('High');
  if (task.category === 'STUDY') labels.push('Study');
  if (task.category === 'WORK') labels.push('Work');
  if (task.category === 'PERSONAL') labels.push('Personal');
  return labels;
};