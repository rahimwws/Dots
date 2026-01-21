/**
 * @description Streak entity types
 */

export interface StreakData {
  currentStreak: number;
  lastVisitDate: string; // Format: YYYY-MM-DD
  longestStreak: number;
}

export interface StreakContextValue {
  currentStreak: number;
  longestStreak: number;
  isLoading: boolean;
  updateStreak: () => Promise<void>;
}
