import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SquircleView } from "expo-squircle-view";
import { CalendarInfo, DayCompleted } from "@/shared/assets";
import { Popover } from "expo-ios-popover";
type CalendarEvent = {
  id: string;
  icons: {
    id: string;
    icon: string;
    bg: string;
    color: string;
  }[];
};

type DayCell = {
  date: Date;
  label: number;
  inMonth: boolean;
  key: string;
  events?: CalendarEvent;
};

type DayProgress = {
  completed: number;
  total?: number;
  color?: string;
};

type HomeCalendarProps = {
  progressByDate?: Record<string, DayProgress>;
  onDatePress?: (dateKey: string) => void;
  selectedDate?: string;
};

const DEFAULT_PROGRESS_COLOR = "#000000";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatKey = (date: Date) => date.toISOString().slice(0, 10);

const getProgressMeta = (progress?: DayProgress) => {
  if (!progress) {
    return { ratio: 0, fillColor: undefined };
  }

  const total = Math.max(progress.total ?? 5, 1);
  const clampedCompleted = Math.max(0, Math.min(progress.completed, total));
  const ratio = clampedCompleted / total;
  return {
    ratio,
    fillColor: progress.color ?? DEFAULT_PROGRESS_COLOR,
  };
};

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

export const HomeCalendar: React.FC<HomeCalendarProps> = ({
  progressByDate,
  onDatePress,
  selectedDate,
}) => {
  const today = useMemo(() => new Date(), []);
  const [currentMonth] = useState(() => ({
    year: today.getUTCFullYear(),
    month: today.getUTCMonth(),
  }));

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

  const matrix = useMemo(
    () => buildMonthMatrix(currentMonth.year, currentMonth.month),
    [currentMonth.month, currentMonth.year]
  );

  const data = progressByDate ?? fallbackProgress;

  return (
    <View style={styles.container}>
      <View style={styles.weekRow}>
        {WEEK_DAYS.map((day) => (
          <Text key={day} style={styles.weekLabel}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {matrix.map((cell) => {
          const isToday = formatKey(cell.date) === formatKey(today);
          const isSelected = selectedDate === cell.key;
          const progress = getProgressMeta(data?.[cell.key]);
          const clampedRatio = Math.max(0, Math.min(1, progress.ratio));
          const textOnFill = clampedRatio >= 0.5;
          const isFilledDay = clampedRatio > 0;
          const isCompletedDay = clampedRatio >= 1;

          return (
            <SquircleView key={cell.key} style={styles.daySlot}>
              <Pressable
                onPress={() => onDatePress?.(cell.key)}
                disabled={!cell.inMonth}
              >
                <SquircleView
                  style={styles.day}
                  cornerSmoothing={100}
                  borderRadius={999}
                >
                  <View
                    style={[
                      styles.dayInner,
                      cell.inMonth ? styles.dayInMonth : styles.dayOutMonth,
                      isSelected && styles.daySelected,
                    ]}
                  >
                  {!isCompletedDay ? (
                    <View
                      pointerEvents="none"
                      style={[
                        styles.borderOverlay,
                        isFilledDay ? styles.borderFilled : styles.borderEmpty,
                        isToday && styles.borderToday,
                      ]}
                    />
                  ) : null}
                  {!isCompletedDay && clampedRatio > 0 ? (
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${clampedRatio * 100}%`,
                          backgroundColor: progress.fillColor,
                        },
                      ]}
                    />
                  ) : null}

                  {isCompletedDay ? (
                    <View pointerEvents="none" style={styles.completedIcon}>
                      <DayCompleted
                        size={26}
                        color="#171717"
                        checkColor="#171717"
                      />
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.dayLabel,
                        isToday && styles.dayLabelToday,
                        textOnFill && styles.dayLabelOnFill,
                      ]}
                    >
                      {cell.label}
                    </Text>
                  )}
                </View>
              </SquircleView>
            </Pressable>
            </SquircleView>
          );
        })}
      </View>

      <View style={styles.infoRow}>
        <Popover id="calendar-info" arrowEdge="bottom">
          <Popover.Trigger>
            <Pressable
              style={({ pressed }) => [
                styles.infoButton,
                pressed && { opacity: 0.7 },
              ]}
              hitSlop={10}
            >
              <CalendarInfo size={22} color="#9D9D9D" />
            </Pressable>
          </Popover.Trigger>

          <Popover.Content
            style={{
              width: 280,
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 16,
            }}
          >
            <Text style={styles.popoverTitle}>How Calendar Works</Text>
            <View style={styles.popoverRow}>
              <View style={styles.popoverDot} />
              <Text style={styles.popoverText}>
                Filled = tasks completed / total
              </Text>
            </View>
            <View style={styles.popoverRow}>
              <View style={[styles.popoverDot, styles.popoverDotEmpty]} />
              <Text style={styles.popoverText}>Dotted = no tasks yet</Text>
            </View>
            <View style={styles.popoverRow}>
              <View style={[styles.popoverDot, styles.popoverDotFull]} />
              <Text style={styles.popoverText}>100% = all tasks done</Text>
            </View>
          </Popover.Content>
        </Popover>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 4,
  },
  infoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#9D9D9D",
    fontFamily: "is-r",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  headerLabel: {
    fontSize: 20,
    fontWeight: "700",
    // color: "#f5f5f5",
    // fontFamily: "is-r",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  weekLabel: {
    width: "14.2857%",
    paddingHorizontal: 6,
    textAlign: "center",
    color: "#A0A0A0",
    fontSize: 16,
    fontFamily: "is-r",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 4,
  },
  daySlot: {
    width: "14.2857%",
    padding: 6,
  },
  day: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
  },
  dayInner: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    position: "relative",
    overflow: "hidden",
  },
  completedIcon: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: -13 }, { translateY: -13 }],
  },
  dayInMonth: {
    opacity: 1,
  },
  dayOutMonth: {
    opacity: 0.35,
  },
  daySelected: {
    backgroundColor: "#F0F0F0",
  },
  dayLabel: {
    fontSize: 18,
    fontFamily: "is-r",
    color: "#1F1F1F",
  },
  dayLabelToday: {
    color: "#1F1F1F",
    fontWeight: "600",
  },
  dayLabelOnFill: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  popoverTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F1F1F",
    marginBottom: 16,
    fontFamily: "is-r",
  },
  popoverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  popoverText: {
    fontSize: 15,
    color: "#4A4A4A",
    fontFamily: "is-r",
  },
  popoverDot: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#000000",
  },
  popoverDotEmpty: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CFCFCF",
  },
  popoverDotFull: {
    backgroundColor: "#000000",
  },
  borderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    borderWidth: 1,
  },
  borderEmpty: {
    borderStyle: "dashed",
    borderColor: "#CFCFCF",
  },
  borderFilled: {
    borderStyle: "solid",
    borderColor: "#000000",
  },
  borderToday: {
    borderColor: "#000000",
    borderWidth: 1,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 1,
  },
});
