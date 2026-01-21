import { useCallback, useMemo, useState } from "react";

import { useMood, type MoodType } from "@/entities/mood";

const QUADRANTS: { label: MoodType; color: string }[] = [
  { label: "Productive", color: "#FF6B6B" },
  { label: "Relaxed", color: "#FF9F1C" },
  { label: "Stressed", color: "#FFD93D" },
  { label: "Anxious", color: "#FF8FAB" },
];

export const useMoodSelection = (date?: string) => {
  const { saveMood } = useMood();
  const [activeIndex, setActiveIndex] = useState(0);

  const moods = useMemo(() => QUADRANTS, []);
  const activeMood = moods[activeIndex];

  const selectMood = useCallback(
    async (index: number) => {
      const next = moods[index];
      setActiveIndex(index);
      await saveMood(next.label, date);
      return next.label;
    },
    [date, moods, saveMood]
  );

  return {
    moods,
    activeIndex,
    activeMood,
    selectMood,
    setActiveIndex,
  };
};

export type MoodQuadrant = (typeof QUADRANTS)[number];
