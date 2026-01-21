import type { Task, TaskStatus } from "../model/task";

export type TaskCompletionMap = Record<string, TaskStatus>;

const normalizeDateKey = (dateKey: string): string => dateKey.slice(0, 10);

const toDayOfWeek = (dateKey: string): number =>
  new Date(`${normalizeDateKey(dateKey)}T00:00:00Z`).getUTCDay();

/**
 * @description Generate unique key for task completion lookup
 * @param taskId - Task ID
 * @param dateKey - Date in YYYY-MM-DD format
 */
export const getTaskCompletionKey = (taskId: string, dateKey: string): string =>
  `${taskId}:${normalizeDateKey(dateKey)}`;

/**
 * @description Check if task should appear on given date
 * @param task - Task to check
 * @param dateKey - Date in YYYY-MM-DD format
 */
export const isTaskScheduledForDate = (task: Task, dateKey: string): boolean => {
  const normalizedDate = normalizeDateKey(dateKey);

  // Non-habit tasks only show on their specific date
  if (task.entryType !== "habit") {
    return task.date === normalizedDate;
  }

  // Don't show habit before start date
  if (normalizedDate < task.date) {
    return false;
  }

  // Daily habits show every day
  if (task.repeatInterval === "daily") {
    return true;
  }

  // Weekly habits show on specific day
  if (task.repeatInterval === "weekly") {
    if (typeof task.repeatWeekday !== "number") {
      return false;
    }
    return toDayOfWeek(normalizedDate) === task.repeatWeekday;
  }

  return false;
};

/**
 * @description Get task status for specific date
 * @param task - Task to check
 * @param dateKey - Date in YYYY-MM-DD format
 * @param completionsByKey - Map of completion statuses
 */
export const getTaskStatusForDate = (
  task: Task,
  dateKey: string,
  completionsByKey: TaskCompletionMap
): TaskStatus => {
  const key = getTaskCompletionKey(task.id, dateKey);
  const completion = completionsByKey[key];

  if (completion) {
    return completion;
  }

  // Habits default to todo for each day
  if (task.entryType === "habit") {
    return "todo";
  }

  return task.status;
};
