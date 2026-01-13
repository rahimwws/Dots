import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTasks } from "@/shared/lib/tasks";
import type { Task, TaskCategory } from "@/shared/lib/tasks/types";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import * as Haptics from "expo-haptics";

type TodayTasksOverviewProps = {
  selectedDate?: string;
};

type WordSegment = {
  text: string;
  isTaskCount?: boolean;
};

const AnimatedWord: React.FC<{
  word: string;
  delay: number;
  isTaskCount?: boolean;
  onPress?: () => void;
}> = ({ word, delay, isTaskCount, onPress }) => {
  const opacity = useSharedValue(0);
  const blurRadius = useSharedValue(10);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) })
    );
    blurRadius.value = withDelay(
      delay,
      withTiming(0, { duration: 150, easing: Easing.out(Easing.ease) })
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurRadius.value > 0 ? blurRadius.value / 10 : 0,
  }));

  return (
    <View style={styles.wordContainer}>
      <Animated.View style={animatedStyle}>
        <Text
          style={isTaskCount ? styles.taskCountText : styles.greetingText}
          onPress={onPress}
        >
          {word}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.wordBlurOverlay, blurStyle]} pointerEvents="none">
        <BlurView intensity={8} tint="extraLight" style={styles.blurView} />
      </Animated.View>
    </View>
  );
};

export const TodayTasksOverview: React.FC<TodayTasksOverviewProps> = ({
  selectedDate,
}) => {
  const { tasks, updateTaskStatus } = useTasks();
  const [currentDate, setCurrentDate] = useState(
    selectedDate || new Date().toISOString().split("T")[0]
  );
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [wordSegments, setWordSegments] = useState<WordSegment[]>([]);
  const [animationKey, setAnimationKey] = useState(0);
  const sheetRef = useRef<TrueSheet>(null);

  // When selectedDate changes, trigger animation restart
  useEffect(() => {
    if (selectedDate && selectedDate !== currentDate) {
      setCurrentDate(selectedDate);
      setAnimationKey((prev) => prev + 1);
    }
  }, [selectedDate]);

  // Filter tasks for selected date
  const dateTasks = tasks.filter((task) => task.date === currentDate);
  const incompleteTasks = dateTasks.filter((task) => task.status === "todo");
  const remainingTasks = incompleteTasks.length;

  // Generate greeting text with date awareness
  const generateGreeting = () => {
    const today = new Date().toISOString().split("T")[0];
    const selectedDateObj = new Date(currentDate + "T00:00:00Z");
    const todayObj = new Date(today + "T00:00:00Z");

    const diffTime = selectedDateObj.getTime() - todayObj.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const hour = new Date().getHours();
    let greeting = "Good morning";
    if (hour >= 12 && hour < 18) {
      greeting = "Good afternoon";
    } else if (hour >= 18) {
      greeting = "Good evening";
    }

    let datePhrase = "";
    if (diffDays === 0) {
      datePhrase = "today";
    } else if (diffDays === 1) {
      datePhrase = "tomorrow";
    } else if (diffDays === -1) {
      datePhrase = "yesterday";
    } else if (diffDays > 1 && diffDays <= 7) {
      datePhrase = `in ${diffDays} days`;
    } else if (diffDays > 7) {
      datePhrase = `on ${selectedDateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    } else if (diffDays < -1) {
      datePhrase = `${Math.abs(diffDays)} days ago`;
    }

    const totalTasks = dateTasks.length;
    const completedTasks = dateTasks.filter(
      (task) => task.status === "done"
    ).length;

    // Generate message based on tasks
    if (remainingTasks === 0 && totalTasks > 0) {
      if (diffDays === 0) {
        return {
          text: `${greeting}, Rahim! All tasks completed for today.`,
          taskCount: null,
        };
      } else {
        return {
          text: `Rahim, all tasks were completed ${datePhrase}.`,
          taskCount: null,
        };
      }
    } else if (remainingTasks === 0) {
      if (diffDays === 0) {
        return {
          text: `${greeting}, Rahim! No tasks scheduled for today.`,
          taskCount: null,
        };
      } else {
        return {
          text: `Rahim, you have no tasks scheduled ${datePhrase}.`,
          taskCount: null,
        };
      }
    } else {
      const taskText = remainingTasks === 1 ? "task" : "tasks";
      if (diffDays === 0) {
        return {
          text: `${greeting}, Rahim! You have `,
          taskCount: `${remainingTasks} ${taskText}`,
          afterText: ` remaining today.`,
        };
      } else {
        return {
          text: `Rahim, you have `,
          taskCount: `${remainingTasks} ${taskText}`,
          afterText: ` ${datePhrase}.`,
        };
      }
    }
  };

  const greeting = generateGreeting();

  // Split text into words for animation
  useEffect(() => {
    const segments: WordSegment[] = [];

    if (greeting.text) {
      greeting.text.split(' ').forEach((word) => {
        if (word) segments.push({ text: word + ' ' });
      });
    }

    if (greeting.taskCount) {
      segments.push({ text: greeting.taskCount, isTaskCount: true });
    }

    if (greeting.afterText) {
      greeting.afterText.split(' ').forEach((word) => {
        if (word) segments.push({ text: ' ' + word });
      });
    }

    setWordSegments(segments);
  }, [greeting]);

  const handleTaskCountPress = () => {
    if (remainingTasks > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsSheetVisible(true);
      sheetRef.current?.present();
    }
  };

  const handleMarkAsDone = async (taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateTaskStatus(taskId, "done");
  };

  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <View style={styles.textRow} key={animationKey}>
          {wordSegments.map((segment, index) => (
            <AnimatedWord
              key={`${animationKey}-${index}`}
              word={segment.text}
              delay={index * 50}
              isTaskCount={segment.isTaskCount}
              onPress={segment.isTaskCount ? handleTaskCountPress : undefined}
            />
          ))}
        </View>
      </View>

      {/* Tasks Bottom Sheet */}
      <TrueSheet
        ref={sheetRef}
        dimmed
        detents={[0.5]}
        cornerRadius={50}
        grabber
        backgroundBlur="default"
        blurOptions={{
          intensity: 50,
          interaction: true,
        }}
        onDidDismiss={() => setIsSheetVisible(false)}
        style={styles.sheetContainer}
      >
        <Text style={styles.sheetTitle}>Your Tasks</Text>
        <View style={styles.tasksList}>
          {incompleteTasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <Text style={styles.taskItemTitle} numberOfLines={2}>
                {task.title}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => {
            if (incompleteTasks.length > 0) {
              handleMarkAsDone(incompleteTasks[0].id);
            }
            sheetRef.current?.dismiss();
          }}
        >
          <Text style={styles.doneButtonText}>Mark as Done</Text>
        </TouchableOpacity>
      </TrueSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    paddingVertical: 20,
  },
  greetingContainer: {
    position: "relative",
  },
  textRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  wordContainer: {
    position: "relative",
  },
  greetingText: {
    fontFamily: "is-r",
    fontSize: 28,
    color: "#7A7A7A",
    lineHeight: 36,
  },
  taskCountText: {
    fontFamily: "is-r",
    fontSize: 28,
    color: "#1F1F1F",
    fontWeight: "600",
    lineHeight: 36,
  },
  wordBlurOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 4,
  },
  blurView: {
    flex: 1,
  },
  sheetContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontFamily: "is-r",
    fontSize: 28,
    color: "#1F1F1F",
    marginBottom: 20,
  },
  tasksList: {
    gap: 12,
    marginBottom: 24,
  },
  taskItem: {
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  taskItemTitle: {
    fontFamily: "is-r",
    fontSize: 16,
    color: "#1F1F1F",
    lineHeight: 22,
  },
  doneButton: {
    backgroundColor: "#000",
    paddingVertical: 20,
    borderRadius: 100,
    alignItems: "center",
  },
  doneButtonText: {
    fontFamily: "is-r",
    fontSize: 20,
    color: "#fff",
  },
});
