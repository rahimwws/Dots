import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { CreateTaskInput, Task, TaskStatus } from "./types";
import { createTask, listTasks, updateTaskStatus } from "./tasks";
import { initTasksDb } from "./db";

type TasksContextValue = {
  tasks: Task[];
  isReady: boolean;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  refresh: () => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | null>(null);

export const TasksProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isReady, setIsReady] = React.useState(false);

  const refresh = useCallback(async () => {
    const list = await listTasks();
    setTasks(list);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      try {
        await initTasksDb();
        if (!isMounted) {
          return;
        }
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
      await createTask(input);
      await refresh();
    },
    [refresh]
  );

  const handleUpdateStatus = useCallback(
    async (id: string, status: TaskStatus) => {
      await updateTaskStatus(id, status);
      await refresh();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      tasks,
      isReady,
      createTask: handleCreateTask,
      updateTaskStatus: handleUpdateStatus,
      refresh,
    }),
    [tasks, isReady, handleCreateTask, handleUpdateStatus, refresh]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error("useTasks must be used within TasksProvider");
  }
  return ctx;
};
