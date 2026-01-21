import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";

import type { Task, TaskStatus, CreateTaskInput } from "./task";
import {
  initTasksDb,
  listTasks,
  listTaskCompletions,
  createTask as createTaskApi,
  updateTaskStatus as updateTaskStatusApi,
  setTaskCompletion as setTaskCompletionApi,
} from "./task-api";
import { getTaskCompletionKey } from "../lib/schedule";

interface TasksContextValue {
  tasks: Task[];
  completionsByKey: Record<string, TaskStatus>;
  isReady: boolean;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  updateTaskStatusForDate: (taskId: string, dateKey: string, status: TaskStatus) => Promise<void>;
  refresh: () => Promise<void>;
}

const TasksContext = createContext<TasksContextValue | null>(null);

/**
 * @description Provider component for task state management
 */
export const TasksProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [completionsByKey, setCompletionsByKey] = React.useState<Record<string, TaskStatus>>({});
  const [isReady, setIsReady] = React.useState(false);

  const refresh = useCallback(async () => {
    const [taskList, completions] = await Promise.all([listTasks(), listTaskCompletions()]);

    const nextCompletions: Record<string, TaskStatus> = {};
    completions.forEach((completion) => {
      nextCompletions[getTaskCompletionKey(completion.taskId, completion.date)] = completion.status;
    });

    setTasks(taskList);
    setCompletionsByKey(nextCompletions);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await initTasksDb();
        if (!isMounted) return;
        await refresh();
        setIsReady(true);
      } catch (error) {
        console.warn("Failed to init tasks db", error);
      }
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [refresh]);

  const handleCreateTask = useCallback(
    async (input: CreateTaskInput) => {
      await createTaskApi(input);
      await refresh();
    },
    [refresh]
  );

  const handleUpdateStatus = useCallback(
    async (id: string, status: TaskStatus) => {
      await updateTaskStatusApi(id, status);
      await refresh();
    },
    [refresh]
  );

  const handleUpdateStatusForDate = useCallback(
    async (taskId: string, dateKey: string, status: TaskStatus) => {
      await setTaskCompletionApi(taskId, dateKey, status);
      await refresh();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      tasks,
      completionsByKey,
      isReady,
      createTask: handleCreateTask,
      updateTaskStatus: handleUpdateStatus,
      updateTaskStatusForDate: handleUpdateStatusForDate,
      refresh,
    }),
    [
      tasks,
      completionsByKey,
      isReady,
      handleCreateTask,
      handleUpdateStatus,
      handleUpdateStatusForDate,
      refresh,
    ]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

/**
 * @description Hook to access task context
 * @throws Error if used outside TasksProvider
 */
export const useTasks = (): TasksContextValue => {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error("useTasks must be used within TasksProvider");
  }
  return ctx;
};
