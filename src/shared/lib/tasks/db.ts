import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;

export const getTasksDb = async () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("tasks.db");
  }
  return dbPromise;
};

export const initTasksDb = async () => {
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
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks (date);
        CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks (category);
      `);
    })();
  }
  return initPromise;
};
