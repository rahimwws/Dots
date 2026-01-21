import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

import type { Mood, MoodType, MoodContextValue } from "./mood";
import { MOOD_MESSAGES } from "./mood";
import { initMoodDb, saveMood as saveMoodApi, getMoodByDate, getTodayMood } from "./mood-api";

const MoodContext = createContext<MoodContextValue | null>(null);

interface MoodProviderProps {
  children: React.ReactNode;
}

/**
 * @description Provider component for mood state management
 */
export const MoodProvider = ({ children }: MoodProviderProps) => {
  const [todayMood, setTodayMood] = useState<Mood | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await initMoodDb();
        const mood = await getTodayMood();
        setTodayMood(mood);
      } catch (error) {
        console.error("Failed to initialize mood:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const saveMood = useCallback(async (mood: MoodType, date?: string) => {
    try {
      const targetDate = date || new Date().toISOString().slice(0, 10);
      const savedMood = await saveMoodApi(mood, targetDate);

      // Update state immediately if saving for today
      if (targetDate === new Date().toISOString().slice(0, 10)) {
        setTodayMood(savedMood);
      }
    } catch (error) {
      console.error("Failed to save mood:", error);
      throw error;
    }
  }, []);

  const getMoodForDate = useCallback(async (date: string): Promise<Mood | null> => {
    try {
      return await getMoodByDate(date);
    } catch (error) {
      console.error("Failed to get mood:", error);
      return null;
    }
  }, []);

  const getMoodMessage = useCallback((mood: MoodType): string => {
    const messages = MOOD_MESSAGES[mood];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  const value: MoodContextValue = {
    todayMood,
    isLoading,
    saveMood,
    getMoodForDate,
    getMoodMessage,
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
};

/**
 * @description Hook to access mood context
 * @throws Error if used outside MoodProvider
 */
export const useMood = (): MoodContextValue => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error("useMood must be used within MoodProvider");
  }
  return context;
};
