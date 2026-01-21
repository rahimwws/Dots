import React, { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { useMood } from "../mood";
import { getTaskStatusForDate, useTasks } from "../tasks";
import type { Task, TaskStatus } from "../tasks";
import type { Mood } from "../mood/types";

const ANDROID_CHANNEL_ID = "reminders";
const MOOD_REMINDER_HOUR = 10;
const MOOD_REMINDER_MINUTE = 0;
const dateKeyFromDate = (date: Date) => date.toISOString().split("T")[0];

const getHabitDueDate = (task: Task, now: Date) => {
  if (!task.dueAt || task.entryType !== "habit") {
    return null;
  }

  const timeSource = new Date(task.dueAt);
  if (Number.isNaN(timeSource.getTime())) {
    return null;
  }

  const startDate = task.date ? new Date(`${task.date}T00:00:00`) : null;
  const anchor = startDate && startDate > now ? startDate : now;
  const next = new Date(anchor);
  next.setHours(timeSource.getHours(), timeSource.getMinutes(), 0, 0);

  if (task.repeatInterval === "weekly") {
    if (typeof task.repeatWeekday !== "number") {
      return null;
    }
    const currentDay = anchor.getDay();
    let daysAhead = (task.repeatWeekday - currentDay + 7) % 7;
    if (daysAhead === 0 && next <= now) {
      daysAhead = 7;
    }
    next.setDate(anchor.getDate() + daysAhead);
  } else {
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  }

  if (startDate && next < startDate) {
    next.setTime(startDate.getTime());
    next.setHours(timeSource.getHours(), timeSource.getMinutes(), 0, 0);
  }

  return next;
};

const buildDateTrigger = (date: Date): Notifications.DateTriggerInput => {
  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
    channelId: Platform.OS === "android" ? ANDROID_CHANNEL_ID : undefined,
  };
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const ensureAndroidChannel = async () => {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Reminders",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    sound: "default",
  });
};

const ensurePermission = async () => {
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;

  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    status = requested.status;
  }

  return status === "granted";
};

const getNextMoodReminderDate = (todayMood: Mood | null) => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const hasMoodToday = todayMood?.date === today;

  const next = new Date(now);
  next.setHours(MOOD_REMINDER_HOUR, MOOD_REMINDER_MINUTE, 0, 0);

  if (hasMoodToday || next <= now) {
    next.setDate(next.getDate() + 1);
    next.setHours(MOOD_REMINDER_HOUR, MOOD_REMINDER_MINUTE, 0, 0);
  }

  return next;
};

const scheduleMoodReminder = async (todayMood: Mood | null) => {
  const triggerDate = getNextMoodReminderDate(todayMood);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Log your mood",
      body: "Open the app and record today’s mood",
      sound: "default",
    },
    trigger: buildDateTrigger(triggerDate),
  });
};

const scheduleTaskNotifications = async (
  tasks: Task[],
  completionsByKey: Record<string, TaskStatus>
) => {
  const now = Date.now();

  for (const task of tasks) {
    const dueDate =
      task.entryType === "habit"
        ? getHabitDueDate(task, new Date(now))
        : task.dueAt
        ? new Date(task.dueAt)
        : null;
    if (!dueDate) {
      continue;
    }
    const dueMs = dueDate.getTime();

    if (Number.isNaN(dueMs)) {
      continue;
    }

    const dateKey = dateKeyFromDate(dueDate);
    const status = getTaskStatusForDate(task, dateKey, completionsByKey);
    if (status !== "todo") {
      continue;
    }

    const thirtyMinutesMs = 30 * 60 * 1000;
    const beforeMs = dueMs - thirtyMinutesMs;
    const notificationLabel = task.entryType === "habit" ? "Habit" : "Task";

    if (beforeMs > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${notificationLabel} in 30 minutes`,
          body: task.title,
          data: { taskId: task.id, type: "task-30m" },
          sound: "default",
        },
        trigger: buildDateTrigger(new Date(beforeMs)),
      });
    }

    if (dueMs > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${notificationLabel} time`,
          body: task.title,
          data: { taskId: task.id, type: "task-due" },
          sound: "default",
        },
        trigger: buildDateTrigger(dueDate),
      });
    }
  }
};

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { tasks, completionsByKey, isReady: tasksReady } = useTasks();
  const { todayMood, isLoading: moodLoading } = useMood();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const isSchedulingRef = useRef(false);
  const isConfiguredRef = useRef(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await ensureAndroidChannel();
        const granted = await ensurePermission();
        setPermissionsGranted(granted);
      } catch (error) {
        console.warn("Failed to configure notifications", error);
      } finally {
        isConfiguredRef.current = true;
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (
      !isConfiguredRef.current ||
      isSchedulingRef.current ||
      !permissionsGranted ||
      !tasksReady ||
      moodLoading
    ) {
      return;
    }

    const reschedule = async () => {
      isSchedulingRef.current = true;
      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await scheduleMoodReminder(todayMood);
        await scheduleTaskNotifications(tasks, completionsByKey);
      } catch (error) {
        console.warn("Failed to reschedule notifications", error);
      } finally {
        isSchedulingRef.current = false;
      }
    };

    reschedule();
  }, [
    permissionsGranted,
    tasksReady,
    moodLoading,
    tasks,
    completionsByKey,
    todayMood,
  ]);

  return <>{children}</>;
};
