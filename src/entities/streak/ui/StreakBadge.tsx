import React from "react";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface StreakBadgeProps {
  current: number;
  longest: number;
}

/**
 * @description Badge showing current and longest streak
 */
export const StreakBadge: React.FC<StreakBadgeProps> = ({ current, longest }) => {
  const { theme } = useUnistyles();

  return (
    <View style={[styles.badge, { borderColor: theme.colors.border }]}>
      <Text style={[styles.value, { color: theme.colors.text }]}>{current}🔥</Text>
      <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>best {longest}</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  value: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    fontFamily: theme.fonts.primary,
    fontSize: 13,
  },
}));
