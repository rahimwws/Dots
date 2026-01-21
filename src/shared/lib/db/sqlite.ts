import * as SQLite from "expo-sqlite";

type DatabaseName = string;

const dbInstances = new Map<DatabaseName, Promise<SQLite.SQLiteDatabase>>();

/**
 * @description Opens or returns existing SQLite database connection
 * @param name - Database file name
 */
export const getDatabase = async (name: DatabaseName): Promise<SQLite.SQLiteDatabase> => {
  if (!dbInstances.has(name)) {
    dbInstances.set(name, SQLite.openDatabaseAsync(name));
  }
  return dbInstances.get(name)!;
};

/**
 * @description Closes database connection
 * @param name - Database file name
 */
export const closeDatabase = async (name: DatabaseName): Promise<void> => {
  const dbPromise = dbInstances.get(name);
  if (dbPromise) {
    const db = await dbPromise;
    await db.closeAsync();
    dbInstances.delete(name);
  }
};

/**
 * @description Generates unique ID for database records
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * @description Returns current date in YYYY-MM-DD format
 */
export const getTodayDateKey = (): string => {
  return new Date().toISOString().slice(0, 10);
};
