/**
 * @description Mood entity types and constants
 */

export type MoodType = "Productive" | "Relaxed" | "Stressed" | "Anxious";

export interface Mood {
  id: string;
  mood: MoodType;
  date: string; // Format: YYYY-MM-DD
  createdAt: string; // ISO string
}

export interface MoodContextValue {
  todayMood: Mood | null;
  isLoading: boolean;
  saveMood: (mood: MoodType, date?: string) => Promise<void>;
  getMoodForDate: (date: string) => Promise<Mood | null>;
  getMoodMessage: (mood: MoodType) => string;
}

/** Mood-based supportive messages */
export const MOOD_MESSAGES: Record<MoodType, string[]> = {
  Productive: [
    "Keep up the great work! You're crushing it today!",
    "Amazing energy! Let's make the most of it!",
    "You're on fire! Keep that momentum going!",
  ],
  Relaxed: [
    "Taking it easy today? Perfect time to recharge",
    "Enjoy the calm. You've earned it!",
    "Sometimes the best productivity is rest.",
  ],
  Stressed: [
    "I see you're having a tough day. Take it one step at a time",
    "Remember to breathe. You've got this!",
    "It's okay to feel stressed. Let's break things down together.",
  ],
  Anxious: [
    "I'm here with you. What's on your mind?",
    "Anxiety is tough, but you're tougher. Let's take it slow.",
    "Take a moment for yourself. You're doing better than you think.",
  ],
};

/** Mood quadrant colors for UI */
export const MOOD_COLORS: Record<MoodType, string> = {
  Productive: "#FF6B6B",
  Relaxed: "#FF9F1C",
  Stressed: "#FFD93D",
  Anxious: "#FF8FAB",
};
