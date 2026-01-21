import React from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface CalendarHeaderProps {
  weekDays: string[];
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ weekDays }) => {
  return (
    <View style={styles.weekRow}>
      {weekDays.map((day) => (
        <Text key={day} style={styles.weekLabel}>
          {day}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  weekLabel: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
    color: theme.colors.textSecondary,
    width: `${100 / 7}%`,
    textAlign: "center",
  },
}));
