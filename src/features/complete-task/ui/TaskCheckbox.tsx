import React from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { Task, TaskStatus } from "@/entities/task";
import { useCompleteTask } from "../model/use-complete-task";

interface TaskCheckboxProps {
  task: Task;
  dateKey?: string;
  onToggle?: (nextStatus: TaskStatus) => void;
}

/**
 * @description Checkbox control for task completion
 */
export const TaskCheckbox: React.FC<TaskCheckboxProps> = ({ task, dateKey, onToggle }) => {
  const { theme } = useUnistyles();
  const { setStatus } = useCompleteTask({ dateKey });
  const isDone = task.status === "done";

  const toggle = async () => {
    const next: TaskStatus = isDone ? "todo" : "done";
    await setStatus(task.id, next);
    onToggle?.(next);
  };

  return (
    <Pressable
      style={[
        styles.box,
        {
          borderColor: theme.colors.border,
          backgroundColor: isDone ? theme.colors.buttonPrimary : "transparent",
        },
      ]}
      onPress={toggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isDone }}
    >
      {isDone ? (
        <Text style={[styles.check, { color: theme.colors.buttonPrimaryText }]}>✓</Text>
      ) : (
        <View style={styles.empty} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create(() => ({
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  check: {
    fontSize: 16,
    fontWeight: "800",
  },
  empty: {
    width: 14,
    height: 14,
    borderRadius: 6,
  },
}));
