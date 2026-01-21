import * as SQLite from "expo-sqlite";

import { generateId, getTodayDateKey } from "@/shared/lib/db";
import { DB_NAMES } from "@/shared/config";
import type { Task, TaskCompletion, TaskStatus, CreateTaskInput } from "./task";
import { TASK_DEFAULTS } from "./task";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;

/**
 * @description Get tasks database instance
 */
export const getTasksDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAMES.TASKS);
  }
  return dbPromise;
};

/**
 * @description Initialize tasks database with schema and migrations
 */
export const initTasksDb = async (): Promise<void> => {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await getTasksDb();

      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          status TEXT NOT NULL,
          category TEXT NOT NULL,
          date TEXT NOT NULL,
          created_at TEXT NOT NULL,
          icon TEXT,
          due_at TEXT,
          entry_type TEXT NOT NULL DEFAULT 'task',
          repeat_interval TEXT,
          repeat_weekday INTEGER
        );
        CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks (date);
        CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks (category);
        CREATE TABLE IF NOT EXISTS task_completions (
          task_id TEXT NOT NULL,
          date TEXT NOT NULL,
          status TEXT NOT NULL,
          PRIMARY KEY (task_id, date)
        );
        CREATE INDEX IF NOT EXISTS idx_task_completions_date ON task_completions (date);
      `);

      // Run migrations for existing databases
      const migrations = [
        "ALTER TABLE tasks ADD COLUMN icon TEXT;",
        "ALTER TABLE tasks ADD COLUMN due_at TEXT;",
        "ALTER TABLE tasks ADD COLUMN entry_type TEXT NOT NULL DEFAULT 'task';",
        "ALTER TABLE tasks ADD COLUMN repeat_interval TEXT;",
        "ALTER TABLE tasks ADD COLUMN repeat_weekday INTEGER;",
      ];

      for (const migration of migrations) {
        try {
          await db.execAsync(migration);
        } catch {
          // Column already exists
        }
      }
    })();
  }
  return initPromise;
};

/**
 * @description List all tasks ordered by date
 */
export const listTasks = async (): Promise<Task[]> => {
  const db = await getTasksDb();
  const rows = await db.getAllAsync<Task>(
    `SELECT id, title, status, category, date, created_at as createdAt, icon,
     due_at as dueAt, entry_type as entryType, repeat_interval as repeatInterval,
     repeat_weekday as repeatWeekday FROM tasks ORDER BY date DESC, created_at DESC`
  );
  return rows ?? [];
};

/**
 * @description Create a new task
 */
export const createTask = async (input: CreateTaskInput): Promise<void> => {
  const db = await getTasksDb();
  const id = generateId();
  const title = input.title.trim();
  const status = input.status ?? TASK_DEFAULTS.STATUS;
  const category = input.category ?? TASK_DEFAULTS.CATEGORY;
  const date = input.date ?? getTodayDateKey();
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO tasks (id, title, status, category, date, created_at, icon, due_at,
     entry_type, repeat_interval, repeat_weekday) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      title,
      status,
      category,
      date,
      createdAt,
      input.icon ?? null,
      input.dueAt ?? null,
      input.entryType ?? TASK_DEFAULTS.ENTRY_TYPE,
      input.repeatInterval ?? null,
      input.repeatWeekday ?? null,
    ]
  );
};

/**
 * @description Update task status by ID
 */
export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<void> => {
  const db = await getTasksDb();
  await db.runAsync("UPDATE tasks SET status = ? WHERE id = ?", [status, id]);
};

/**
 * @description List all task completions
 */
export const listTaskCompletions = async (): Promise<TaskCompletion[]> => {
  const db = await getTasksDb();
  const rows = await db.getAllAsync<TaskCompletion>(
    "SELECT task_id as taskId, date, status FROM task_completions"
  );
  return rows ?? [];
};

/**
 * @description Set task completion for specific date
 */
export const setTaskCompletion = async (
  taskId: string,
  date: string,
  status: TaskStatus
): Promise<void> => {
  const db = await getTasksDb();
  await db.runAsync(
    `INSERT INTO task_completions (task_id, date, status)
     VALUES (?, ?, ?)
     ON CONFLICT(task_id, date) DO UPDATE SET status = excluded.status`,
    [taskId, date, status]
  );
};
