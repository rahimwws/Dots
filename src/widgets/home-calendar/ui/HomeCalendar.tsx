import React from "react";
import { View, Text } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { CalendarInfo } from "@/shared/assets";
import { Popover } from "expo-ios-popover";

import { CalendarHeader } from "./CalendarHeader";
import { CalendarDay } from "./CalendarDay";
import { useCalendarData } from "../model/use-calendar-data";

interface HomeCalendarProps {
  progressByDate?: Record<string, ReturnType<typeof useCalendarData>["data"][string]>;
  onDatePress?: (dateKey: string) => void;
  selectedDate?: string;
}

/**
 * @description Monthly calendar with completion fill per day.
 * @remarks Kept under 120 lines by splitting header/day components.
 */
export const HomeCalendar: React.FC<HomeCalendarProps> = ({
  progressByDate,
  onDatePress,
  selectedDate,
}) => {
  const { theme } = useUnistyles();
  const { weekDays, matrix, data, todayKey, getProgressMeta } = useCalendarData(progressByDate);

  return (
    <View style={styles.container}>
      <CalendarHeader weekDays={weekDays} />

      <View style={styles.grid}>
        {matrix.map((cell) => {
          const progress = getProgressMeta(data?.[cell.key]);
          return (
            <CalendarDay
              key={cell.key}
              cell={cell}
              todayKey={todayKey}
              selectedDate={selectedDate}
              progressRatio={progress.ratio}
              fillColor={progress.fillColor ?? theme.colors.calendarCheck}
              onPress={onDatePress}
            />
          );
        })}
      </View>

      <View style={styles.infoRow}>
        <Popover id="calendar-info" arrowEdge="bottom">
          <Popover.Trigger>
            <View style={styles.infoButton}>
              <CalendarInfo />
            </View>
          </Popover.Trigger>
          <Popover.Content>
            <View style={styles.popoverContent}>
              <View style={styles.legendDot} />
              <View style={styles.legendTextGroup}>
                <Text style={styles.popoverTitle}>Daily completion</Text>
                <Text style={styles.popoverText}>
                  Filled circles show completion ratio. Full fill means all tasks done.
                </Text>
              </View>
            </View>
          </Popover.Content>
        </Popover>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    gap: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 0,
    justifyContent: "space-between",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 6,
    marginTop: 4,
  },
  infoButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  popoverContent: {
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    gap: 8,
    maxWidth: 260,
  },
  popoverTitle: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  popoverText: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
    color: theme.colors.textSecondary,
    maxWidth: 220,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.calendarCheck,
    marginTop: 6,
  },
  legendTextGroup: {
    flex: 1,
    gap: 4,
  },
}));
