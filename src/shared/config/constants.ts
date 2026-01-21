/**
 * @description App-wide constants
 */

/** Storage keys for AsyncStorage */
export const STORAGE_KEYS = {
  USER_NAME: "user_name",
  STREAK_DATA: "@app_streak_data",
  ONBOARDING_COMPLETED: "@app_onboarding_completed",
  SIGNATURE: "user_signature",
  QUOTE_HINT_SHOWN: "@quote_hint_shown",
} as const;

/** Database names */
export const DB_NAMES = {
  TASKS: "tasks.db",
  MOOD: "mood.db",
} as const;

/** Animation timing */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/** Date format */
export const DATE_FORMAT = "YYYY-MM-DD";
