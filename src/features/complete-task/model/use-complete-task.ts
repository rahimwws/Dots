import { useCallback } from "react";

import { useTasks, type TaskStatus } from "@/entities/task";

interface UseCompleteTaskOptions {
  dateKey?: string;
}

/**
 * @description Update task status (supports date-specific for habits)
 */
export const useCompleteTask = ({ dateKey }: UseCompleteTaskOptions = {}) => {
  const { updateTaskStatus, updateTaskStatusForDate } = useTasks();

  const setStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      if (dateKey) {
        await updateTaskStatusForDate(taskId, dateKey, status);
      } else {
        await updateTaskStatus(taskId, status);
      }
    },
    [dateKey, updateTaskStatus, updateTaskStatusForDate]
  );

  return { setStatus };
};
