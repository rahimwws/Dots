import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { CreateTaskInput } from "@/entities/task";
import { useCreateTask } from "../model/use-create-task";

interface CreateTaskButtonProps {
  task: CreateTaskInput;
  label?: string;
  onCreated?: () => void;
}

/**
 * @description Primary button that creates a task via Tasks store
 */
export const CreateTaskButton: React.FC<CreateTaskButtonProps> = ({
  task,
  label = "Add task",
  onCreated,
}) => {
  const { theme } = useUnistyles();
  const { create, isSubmitting, error } = useCreateTask();

  const handlePress = async () => {
    await create(task);
    if (!error) {
      onCreated?.();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          { backgroundColor: theme.colors.buttonPrimary, borderRadius: theme.borderRadius.pill },
        ]}
        disabled={isSubmitting}
        onPress={handlePress}
      >
        {isSubmitting ? (
          <ActivityIndicator color={theme.colors.buttonPrimaryText} />
        ) : (
          <Text style={[styles.label, { color: theme.colors.buttonPrimaryText }]}>{label}</Text>
        )}
      </Pressable>
      {error ? <Text style={[styles.error, { color: theme.colors.textError }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: 8,
  },
  button: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  error: {
    fontFamily: theme.fonts.primary,
    fontSize: 13,
  },
}));
