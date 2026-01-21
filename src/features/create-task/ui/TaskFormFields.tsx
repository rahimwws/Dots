import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { CreateTaskInput } from "@/entities/task";

interface TaskFormFieldsProps {
  initial?: Partial<CreateTaskInput>;
  onChange: (value: CreateTaskInput) => void;
}

/**
 * @description Minimal controlled form for task title/category
 */
export const TaskFormFields: React.FC<TaskFormFieldsProps> = ({ initial, onChange }) => {
  const { theme } = useUnistyles();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<CreateTaskInput["category"]>(initial?.category);

  const emitChange = (next: Partial<CreateTaskInput>) => {
    const value: CreateTaskInput = {
      title,
      category: category ?? "today",
      ...initial,
      ...next,
    };
    onChange(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title</Text>
        <TextInput
          value={title}
          placeholder="What needs to be done?"
          placeholderTextColor={theme.colors.textTertiary}
          onChangeText={(text) => {
            setTitle(text);
            emitChange({ title: text });
          }}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.backgroundSecondary,
            },
          ]}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
        <TextInput
          value={category ?? ""}
          placeholder="today / workout / shadow"
          placeholderTextColor={theme.colors.textTertiary}
          onChangeText={(text) => {
            const value = text as CreateTaskInput["category"];
            setCategory(value);
            emitChange({ category: value });
          }}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.backgroundSecondary,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: theme.fonts.primary,
    fontSize: 15,
  },
}));
