import { getTasksDb } from "./db";
import { CreateTaskInput, Task, TaskCategory, TaskStatus } from "./types";

const DEFAULT_STATUS: TaskStatus = "todo";
const DEFAULT_CATEGORY: TaskCategory = "today";

const createTaskId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeDate = (date?: string) => {
  if (date) {
    return date;
  }
  return new Date().toISOString().slice(0, 10);
};

export const listTasks = async (): Promise<Task[]> => {
  const db = await getTasksDb();
  const rows = await db.getAllAsync<Task>(
    "SELECT id, title, status, category, date, created_at as createdAt FROM tasks ORDER BY date DESC, created_at DESC"
  );
  return rows ?? [];
};

export const createTask = async (input: CreateTaskInput) => {
  const db = await getTasksDb();
  const id = createTaskId();
  const title = input.title.trim();
  const status = input.status ?? DEFAULT_STATUS;
  const category = input.category ?? DEFAULT_CATEGORY;
  const date = normalizeDate(input.date);
  const createdAt = new Date().toISOString();

  await db.runAsync(
    "INSERT INTO tasks (id, title, status, category, date, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [id, title, status, category, date, createdAt]
  );
};

export const updateTaskStatus = async (id: string, status: TaskStatus) => {
  const db = await getTasksDb();
  await db.runAsync("UPDATE tasks SET status = ? WHERE id = ?", [
    status,
    id,
  ]);
};
