import { useMemo } from 'react';
import { Task } from '@/constants/data';

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  highPriorityTasks: number;
  completionRate: number;
  successRate: string;
  missedTasks: number;
  tasksByCategory: { label: string; value: string; width: string; count: number }[];
  weeklyActivity: number[];
  peakDay: string;
  peakDayFormatted: string;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  productivityScore: number;

  // Status Distribution
  todoCount: number;
  inProgressCount: number;
  reviewCount: number;
  doneCount: number;
  todoPercent: number;
  inProgressPercent: number;
  reviewPercent: number;
  donePercent: number;
}

export function useStats(tasks: Task[]): TaskStats {
  return useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const pendingTasks = tasks.filter((t) => t.status === 'TODO' || t.status === 'IN PROGRESS' || t.status === 'REVIEW').length;
    const highPriorityTasks = tasks.filter((t) => t.priority === 'HIGH').length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const successRate = completionRate + '%';

    // Missed tasks: past due and not done
    const now = new Date();
    const missedTasks = tasks.filter(
      (t) => t.status !== 'DONE' && new Date(t.dueDate) < now
    ).length;

    // Tasks by category
    const categories = ['WORK', 'STUDY', 'PERSONAL'] as const;
    const maxCategoryCount = Math.max(
      1,
      ...categories.map((cat) => tasks.filter((t) => t.category === cat).length)
    );
    const tasksByCategory = categories.map((cat) => {
      const count = tasks.filter((t) => t.category === cat).length;
      const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
      const width = Math.max(8, Math.round((count / maxCategoryCount) * 100));
      return {
        label: cat === 'WORK' ? 'Work' : cat === 'STUDY' ? 'Study' : 'Personal',
        value: pct + '%',
        width: width + '%' as string,
        count,
      };
    }).filter(c => c.count > 0 || tasks.length === 0);

    // Weekly activity: tasks created/completed per day for last 7 days
    const weeklyActivity: number[] = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    tasks.forEach((task) => {
      const taskDate = new Date(task.createdAt);
      const diffDays = Math.round((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        weeklyActivity[6 - diffDays]++;
      }
    });

    // Peak day
    const maxActivity = Math.max(...weeklyActivity);
    const peakDayIndex = weeklyActivity.indexOf(maxActivity);
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const peakDay = dayNames[peakDayIndex] || 'Mon';
    const peakDayFormatted = peakDay + ', 10:00 AM';

    // Priority counts
    const highPriorityCount = highPriorityTasks;
    const mediumPriorityCount = tasks.filter((t) => t.priority === 'MED').length;
    const lowPriorityCount = tasks.filter((t) => t.priority === 'LOW').length;

    // Status counts and percentages
    const todoCount = tasks.filter((t) => t.status === 'TODO').length;
    const inProgressCount = tasks.filter((t) => t.status === 'IN PROGRESS').length;
    const reviewCount = tasks.filter((t) => t.status === 'REVIEW').length;
    const doneCount = completedTasks;

    const todoPercent = totalTasks > 0 ? Math.round((todoCount / totalTasks) * 100) : 0;
    const inProgressPercent = totalTasks > 0 ? Math.round((inProgressCount / totalTasks) * 100) : 0;
    const reviewPercent = totalTasks > 0 ? Math.round((reviewCount / totalTasks) * 100) : 0;
    const donePercent = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

    // Productivity score calculation: Completed / Total * 100
    const score = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      highPriorityTasks,
      completionRate,
      successRate,
      missedTasks,
      tasksByCategory,
      weeklyActivity,
      peakDay,
      peakDayFormatted,
      highPriorityCount,
      mediumPriorityCount,
      lowPriorityCount,
      productivityScore: score,

      // Status Distribution
      todoCount,
      inProgressCount,
      reviewCount,
      doneCount,
      todoPercent,
      inProgressPercent,
      reviewPercent,
      donePercent,
    };
  }, [tasks]);
}