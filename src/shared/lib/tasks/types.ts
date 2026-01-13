export type TaskStatus = "todo" | "done";
export type TaskCategory = "today" | "workout" | "shadow";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  category: TaskCategory;
  date: string;
  createdAt: string;
};

export type CreateTaskInput = {
  title: string;
  status?: TaskStatus;
  category?: TaskCategory;
  date?: string;
};
