/**
 * @description Task entity types and constants
 */

export type TaskStatus = "todo" | "done";
export type TaskCategory = "today" | "workout" | "shadow";
export type TaskEntryType = "task" | "habit";
export type HabitRepeatInterval = "daily" | "weekly";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  category: TaskCategory;
  date: string;
  createdAt: string;
  icon?: string;
  dueAt?: string | null;
  entryType?: TaskEntryType;
  repeatInterval?: HabitRepeatInterval | null;
  repeatWeekday?: number | null;
}

export interface TaskCompletion {
  taskId: string;
  date: string;
  status: TaskStatus;
}

export interface CreateTaskInput {
  title: string;
  status?: TaskStatus;
  category?: TaskCategory;
  date?: string;
  icon?: string;
  dueAt?: string | null;
  entryType?: TaskEntryType;
  repeatInterval?: HabitRepeatInterval | null;
  repeatWeekday?: number | null;
}

/** Default values for task creation */
export const TASK_DEFAULTS = {
  STATUS: "todo" as TaskStatus,
  CATEGORY: "today" as TaskCategory,
  ENTRY_TYPE: "task" as TaskEntryType,
} as const;
