import React from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { MoodQuadrant } from "../model/use-mood-selection";
import { MoodDot } from "./MoodDot";

interface MoodGridProps {
  moods: MoodQuadrant[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/**
 * @description 2x2 mood selector grid with color preview
 */
export const MoodGrid: React.FC<MoodGridProps> = ({ moods, activeIndex, onSelect }) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.grid}>
      {moods.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={item.label}
            style={[
              styles.card,
              { borderColor: isActive ? item.color : theme.colors.border },
              isActive && { backgroundColor: `${item.color}22` },
            ]}
            onPress={() => onSelect(index)}
          >
            <View style={styles.header}>
              <MoodDot color={item.color} />
              <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
            </View>
            <Text style={styles.helper}>Tap to choose</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    flexBasis: "48%",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  label: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  labelActive: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  helper: {
    fontFamily: theme.fonts.primary,
    fontSize: 13,
    color: theme.colors.textTertiary,
  },
}));
