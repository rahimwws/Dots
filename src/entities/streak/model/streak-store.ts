import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

import { storage } from "@/shared/lib/storage";
import { STORAGE_KEYS } from "@/shared/config";
import type { StreakData, StreakContextValue } from "./streak";

const StreakContext = createContext<StreakContextValue | null>(null);

interface StreakProviderProps {
  children: React.ReactNode;
}

const getToday = (): string => new Date().toISOString().slice(0, 10);

const getYesterday = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

/**
 * @description Provider component for streak state management
 */
export const StreakProvider = ({ children }: StreakProviderProps) => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load streak data on mount
  useEffect(() => {
    const loadStreak = async () => {
      try {
        const data = await storage.getObject<StreakData>(STORAGE_KEYS.STREAK_DATA);
        if (data) {
          setCurrentStreak(data.currentStreak);
          setLongestStreak(data.longestStreak);
        }
      } catch (error) {
        console.error("Failed to load streak:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStreak();
  }, []);

  const updateStreak = useCallback(async () => {
    try {
      const today = getToday();
      const yesterday = getYesterday();

      const data = await storage.getObject<StreakData>(STORAGE_KEYS.STREAK_DATA);
      let streakData: StreakData;

      if (!data) {
        // First visit
        streakData = { currentStreak: 1, lastVisitDate: today, longestStreak: 1 };
      } else {
        streakData = data;

        if (streakData.lastVisitDate === today) {
          // Already visited today
          return;
        } else if (streakData.lastVisitDate === yesterday) {
          // Visited yesterday - increment streak
          streakData.currentStreak += 1;
          streakData.lastVisitDate = today;

          if (streakData.currentStreak > streakData.longestStreak) {
            streakData.longestStreak = streakData.currentStreak;
          }
        } else {
          // Missed days - reset streak
          streakData.currentStreak = 1;
          streakData.lastVisitDate = today;
        }
      }

      await storage.setObject(STORAGE_KEYS.STREAK_DATA, streakData);
      setCurrentStreak(streakData.currentStreak);
      setLongestStreak(streakData.longestStreak);
    } catch (error) {
      console.error("Failed to update streak:", error);
    }
  }, []);

  // Auto-update streak on mount
  useEffect(() => {
    if (!isLoading) {
      updateStreak();
    }
  }, [isLoading, updateStreak]);

  const value: StreakContextValue = {
    currentStreak,
    longestStreak,
    isLoading,
    updateStreak,
  };

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
};

/**
 * @description Hook to access streak context
 * @throws Error if used outside StreakProvider
 */
export const useStreak = (): StreakContextValue => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error("useStreak must be used within StreakProvider");
  }
  return context;
};
