import { useMemo, useState } from "react";

export type DayProgress = {
  completed: number;
  total?: number;
  color?: string;
};

export type DayCell = {
  date: Date;
  label: number;
  inMonth: boolean;
  key: string;
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const useCalendarData = (progressByDate?: Record<string, DayProgress>) => {
  const today = useMemo(() => new Date(), []);
  const [currentMonth] = useState(() => ({
    year: today.getUTCFullYear(),
    month: today.getUTCMonth(),
  }));

  const formatKey = (date: Date) => date.toISOString().slice(0, 10);

  const buildMonthMatrix = (year: number, month: number): DayCell[] => {
    const firstOfMonth = new Date(Date.UTC(year, month, 1));
    const firstWeekday = (firstOfMonth.getUTCDay() + 6) % 7; // Monday=0
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const prevDays = firstWeekday;
    const totalCells = Math.ceil((prevDays + daysInMonth) / 7) * 7;

    const cells: DayCell[] = [];
    for (let i = 0; i < totalCells; i += 1) {
      const dayNum = i - prevDays + 1;
      const date = new Date(Date.UTC(year, month, dayNum));
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      cells.push({
        date,
        label: date.getUTCDate(),
        inMonth,
        key: formatKey(date),
      });
    }
    return cells;
  };

  const fallbackProgress = useMemo(() => {
    const day = (d: number) =>
      formatKey(new Date(Date.UTC(currentMonth.year, currentMonth.month, d)));

    return {
      [day(2)]: { completed: 1, total: 5 },
      [day(5)]: { completed: 2, total: 4 },
      [day(11)]: { completed: 3, total: 5 },
      [day(18)]: { completed: 5, total: 5 },
      [formatKey(today)]: { completed: 4, total: 5 },
    };
  }, [currentMonth.month, currentMonth.year, today]);

  const data = progressByDate ?? fallbackProgress;
  const matrix = useMemo(
    () => buildMonthMatrix(currentMonth.year, currentMonth.month),
    [currentMonth.month, currentMonth.year]
  );

  const getProgressMeta = (progress?: DayProgress) => {
    if (!progress) {
      return { ratio: 0, fillColor: undefined };
    }

    const total = Math.max(progress.total ?? 5, 1);
    const clampedCompleted = Math.max(0, Math.min(progress.completed, total));
    const ratio = clampedCompleted / total;
    return {
      ratio,
      fillColor: progress.color,
    };
  };

  return {
    weekDays: WEEK_DAYS,
    todayKey: formatKey(today),
    formatKey,
    matrix,
    data,
    getProgressMeta,
  };
};
