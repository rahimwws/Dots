import React from "react";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { MoodType } from "../model/mood";
import { MOOD_COLORS } from "../model/mood";

interface MoodBadgeProps {
  mood: MoodType;
}

/**
 * @description Small badge with mood color + label
 */
export const MoodBadge: React.FC<MoodBadgeProps> = ({ mood }) => {
  const { theme } = useUnistyles();
  const color = MOOD_COLORS[mood];

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color: theme.colors.text }]}>{mood}</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
  },
  text: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
    fontWeight: "600",
  },
}));
