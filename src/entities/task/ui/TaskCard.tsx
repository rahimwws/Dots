import React from "react";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { Task } from "../model/task";

interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
  rightSlot?: React.ReactNode;
}

/**
 * @description Compact task card for lists
 */
export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, rightSlot }) => {
  const { theme } = useUnistyles();

  return (
    <View
      style={[
        styles.card,
        { borderColor: theme.colors.border, backgroundColor: theme.colors.backgroundSecondary },
      ]}
      onTouchEnd={() => onPress?.(task)}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{task.title}</Text>
        <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
          {task.category} • {task.date}
        </Text>
      </View>
      {rightSlot}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  content: {
    flexShrink: 1,
    gap: 4,
  },
  title: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    fontFamily: theme.fonts.primary,
    fontSize: 13,
  },
}));
