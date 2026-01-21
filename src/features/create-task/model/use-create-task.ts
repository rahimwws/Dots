import { useCallback, useState } from "react";

import { useTasks, type CreateTaskInput } from "@/entities/task";
import { getTodayDateKey } from "@/shared/lib/db";

interface UseCreateTaskResult {
  create: (input: CreateTaskInput) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * @description Create task with basic validation
 */
export const useCreateTask = (): UseCreateTaskResult => {
  const { createTask } = useTasks();
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (input: CreateTaskInput) => {
      if (!input.title?.trim()) {
        setError("Title is required");
        return;
      }
      setSubmitting(true);
      setError(null);
      try {
        await createTask({
          status: "todo",
          category: input.category ?? "today",
          date: input.date ?? getTodayDateKey(),
          entryType: input.entryType ?? "task",
          ...input,
          title: input.title.trim(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create task");
      } finally {
        setSubmitting(false);
      }
    },
    [createTask]
  );

  return { create, isSubmitting, error };
};
