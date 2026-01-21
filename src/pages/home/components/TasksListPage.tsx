import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { getTaskStatusForDate, isTaskScheduledForDate, useTasks, type Task } from "@/entities/task";
import { TaskCheckbox } from "@/features/complete-task";
import { Lucide } from "@react-native-vector-icons/lucide";
import { SquircleView } from "expo-squircle-view";
import { ShimmerText } from "./ShimmerText";

type TimeOfDay = "morning" | "afternoon" | "evening";

interface TasksListPageProps {
  width: number;
  pageHeight: number;
  bottomInset: number;
}

interface GroupedTasks {
  morning: Task[];
  afternoon: Task[];
  evening: Task[];
}

export const TasksListPage: React.FC<TasksListPageProps> = ({ width, pageHeight, bottomInset }) => {
  const { tasks, completionsByKey } = useTasks();
  const { theme } = useUnistyles();
  const today = new Date().toISOString().split("T")[0];

  // Группировка тасков по времени дня
  const groupedTasks = useMemo(() => {
    const todayTasks = tasks.filter((task) =>
      isTaskScheduledForDate(task, today)
    );

    const grouped: GroupedTasks = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    const getTaskHour = (task: Task): number => {
      // Используем dueAt если есть, иначе createdAt
      const timeString = task.dueAt || task.createdAt;
      const date = new Date(timeString);
      return date.getHours();
    };

    // Сортируем таски по времени
    const sortedTasks = [...todayTasks].sort((a, b) => {
      const hourA = getTaskHour(a);
      const hourB = getTaskHour(b);
      return hourA - hourB;
    });

    sortedTasks.forEach((task) => {
      const hour = getTaskHour(task);

      if (hour >= 5 && hour < 12) {
        grouped.morning.push(task);
      } else if (hour >= 12 && hour < 17) {
        grouped.afternoon.push(task);
      } else {
        grouped.evening.push(task);
      }
    });

    return grouped;
  }, [tasks, today]);

  // Подсчет выполненных тасков за сегодня
  const completedTasksCount = useMemo(() => {
    return tasks.filter(
      (task) =>
        isTaskScheduledForDate(task, today) &&
        getTaskStatusForDate(task, today, completionsByKey) === "done"
    ).length;
  }, [tasks, today, completionsByKey]);

  const getTimeLabel = (timeOfDay: TimeOfDay) => {
    switch (timeOfDay) {
      case "morning":
        return "Morning";
      case "afternoon":
        return "Afternoon";
      case "evening":
        return "Evening";
    }
  };

  const getTimeIcon = (timeOfDay: TimeOfDay) => {
    switch (timeOfDay) {
      case "morning":
        return "sunrise";
      case "afternoon":
        return "sun";
      case "evening":
        return "sunset";
    }
  };

  const renderTaskGroup = (
    timeOfDay: TimeOfDay,
    tasks: typeof groupedTasks.morning
  ) => {
    if (tasks.length === 0) return null;

    return (
      <View style={styles.timeGroup}>
        <View style={styles.timeHeader}>
          <Lucide
            name={getTimeIcon(timeOfDay) as any}
            size={16}
            color={theme.colors.textSecondary}
            style={styles.timeIcon}
          />
          <Text
            style={[styles.timeLabel, { color: theme.colors.textSecondary }]}
          >
            {getTimeLabel(timeOfDay)}
          </Text>
        </View>

        {tasks.map((task: (typeof tasks)[0], index: number) => {
          const taskStatus = getTaskStatusForDate(
            task,
            today,
            completionsByKey
          );
          return (
            <SquircleView
              preserveSmoothing
              cornerSmoothing={80}
              borderRadius={15}
              key={task.id}
              style={[
                styles.taskItem,
                {
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                },
                index === tasks.length - 1 && styles.taskItemLast,
              ]}
            >
              <View style={styles.taskContent}>
                {task.icon && (
                  <View style={[styles.taskIconContainer]}>
                    <Lucide
                      name={task.icon as any}
                      size={20}
                      color={theme.colors.text}
                    />
                  </View>
                )}
                <View style={styles.taskTextContainer}>
                  <Text
                    style={[
                      styles.taskTitle,
                      {
                        color: theme.colors.text,
                        textDecorationLine:
                          taskStatus === "done" ? "line-through" : "none",
                        opacity: taskStatus === "done" ? 0.5 : 1,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>
                </View>
                <TaskCheckbox task={task} dateKey={today} />
              </View>

            {/* Можно добавить время выполнения, если нужно */}
            {/* <Text style={[styles.taskDuration, { color: theme.colors.textSecondary }]}>
              45 min
            </Text> */}
            </SquircleView>
          );
        })}
      </View>
    );
  };

  const hasAnyTasks =
    groupedTasks.morning.length > 0 ||
    groupedTasks.afternoon.length > 0 ||
    groupedTasks.evening.length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height: pageHeight,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={styles.shimmerContainer}>
        <ShimmerText
          text={[
            { text: "swipe ", bold: false },
            { text: "me", bold: true },
            { text: " left", bold: false },
          ]}
        />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: bottomInset + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Today&apos;s Schedule
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <SquircleView
            preserveSmoothing
            cornerSmoothing={80}
            borderRadius={12}
            style={styles.completed}
          >
            <DayCompleted size={18} color={theme.colors.text} />

            <Text style={styles.completedText}>{completedTasksCount}</Text>
          </SquircleView>
        </View>

        {hasAnyTasks ? (
          <>
            {renderTaskGroup("morning", groupedTasks.morning)}
            {renderTaskGroup("afternoon", groupedTasks.afternoon)}
            {renderTaskGroup("evening", groupedTasks.evening)}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconContainer,
                { backgroundColor: theme.colors.backgroundSecondary },
              ]}
            >
              <Lucide
                name="calendar-check"
                size={48}
                color={theme.colors.textSecondary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No tasks for today
            </Text>
            <Text
              style={[
                styles.emptyDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              Add your first task to get started with your day
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    paddingTop: rt.insets.top,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  completed: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    marginTop: 5,
    gap: 5,
    backgroundColor: theme.colors.backgroundQuaternary,
  },
  completedText: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  header: {
    marginBottom: 32,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  shimmerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    position: "absolute",
    top: 0,
    right: -20,
    bottom: 0,
    marginTop: 50,
    transform: [{ rotate: "-90deg" }],
    zIndex: 100,
  },
  title: {
    fontFamily: theme.fonts.primary,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
  },
  timeGroup: {
    marginBottom: 32,
  },
  timeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingLeft: 4,
  },
  timeIcon: {
    marginRight: 8,
  },
  timeLabel: {
    fontFamily: theme.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    zIndex: 24,
  },
  taskItemLast: {
    marginBottom: 0,
  },
  checkbox: {
    marginRight: 12,
    padding: 4,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  taskContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  taskIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: theme.colors.backgroundQuaternary,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: theme.fonts.primary,
    fontSize: 18,
    lineHeight: 20,
  },
  taskDuration: {
    fontFamily: theme.fonts.primary,
    fontSize: 13,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: theme.fonts.primary,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
}));
