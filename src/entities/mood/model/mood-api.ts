import * as SQLite from "expo-sqlite";

import { DB_NAMES } from "@/shared/config";
import { getTodayDateKey } from "@/shared/lib/db";
import type { Mood, MoodType } from "./mood";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;

/**
 * @description Get mood database instance
 */
export const getMoodDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAMES.MOOD);
  }
  return dbPromise;
};

/**
 * @description Initialize mood database with schema
 */
export const initMoodDb = async (): Promise<void> => {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await getMoodDb();
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS moods (
          id TEXT PRIMARY KEY NOT NULL,
          mood TEXT NOT NULL,
          date TEXT NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE(date)
        );
        CREATE INDEX IF NOT EXISTS idx_moods_date ON moods (date);
      `);
    })();
  }
  return initPromise;
};

/**
 * @description Save or update mood for specific date
 */
export const saveMood = async (mood: MoodType, date: string): Promise<Mood> => {
  const db = await getMoodDb();
  const id = `${date}-${Date.now()}`;
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT OR REPLACE INTO moods (id, mood, date, created_at) VALUES (?, ?, ?, ?)`,
    [id, mood, date, createdAt]
  );

  return { id, mood, date, createdAt };
};

/**
 * @description Get mood for specific date
 */
export const getMoodByDate = async (date: string): Promise<Mood | null> => {
  const db = await getMoodDb();
  const result = await db.getFirstAsync<{
    id: string;
    mood: MoodType;
    date: string;
    created_at: string;
  }>("SELECT id, mood, date, created_at FROM moods WHERE date = ?", [date]);

  if (!result) return null;

  return {
    id: result.id,
    mood: result.mood,
    date: result.date,
    createdAt: result.created_at,
  };
};

/**
 * @description Get today's mood
 */
export const getTodayMood = async (): Promise<Mood | null> => {
  return getMoodByDate(getTodayDateKey());
};

/**
 * @description Get all moods ordered by date descending
 */
export const getAllMoods = async (): Promise<Mood[]> => {
  const db = await getMoodDb();
  const results = await db.getAllAsync<{
    id: string;
    mood: MoodType;
    date: string;
    created_at: string;
  }>("SELECT id, mood, date, created_at FROM moods ORDER BY date DESC");

  return results.map((row) => ({
    id: row.id,
    mood: row.mood,
    date: row.date,
    createdAt: row.created_at,
  }));
};
