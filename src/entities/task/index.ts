// Types
export type {
  Task,
  TaskStatus,
  TaskCategory,
  TaskEntryType,
  HabitRepeatInterval,
  TaskCompletion,
  CreateTaskInput,
} from "./model/task";
export { TASK_DEFAULTS } from "./model/task";

// Store
export { TasksProvider, useTasks } from "./model/task-store";

// API
export {
  initTasksDb,
  listTasks,
  createTask,
  updateTaskStatus,
  listTaskCompletions,
  setTaskCompletion,
} from "./model/task-api";

// Schedule utils
export type { TaskCompletionMap } from "./lib/schedule";
export {
  getTaskCompletionKey,
  isTaskScheduledForDate,
  getTaskStatusForDate,
} from "./lib/schedule";

// UI
export { TaskCard } from "./ui/TaskCard";
