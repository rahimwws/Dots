import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { getTaskStatusForDate, isTaskScheduledForDate, useTasks } from "@/entities/task";
import { TaskCheckbox } from "@/features/complete-task";
import { useMood } from "@/entities/mood";
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
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Lucide } from "@react-native-vector-icons/lucide";
import { toast } from "@/shared/ui";
import { useUserName } from "@/entities/user";

type TodayTasksOverviewProps = {
  selectedDate?: string;
};

type WordSegment = {
  text: string;
  isTaskCount?: boolean;
  isClickable?: boolean;
  isHighlighted?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AnimatedWord: React.FC<{
  word: string;
  delay: number;
  isTaskCount?: boolean;
  isClickable?: boolean;
  isHighlighted?: boolean;
  onPress?: () => void;
}> = ({ word, delay, isTaskCount, isClickable, isHighlighted, onPress }) => {
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
  }, [delay, opacity, blurRadius]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurRadius.value > 0 ? blurRadius.value / 10 : 0,
  }));

  // Check if this is a line break (after all hooks)
  if (word === "\n") {
    return <View style={{ width: "100%", height: 8 }} />;
  }

  const textStyle = isTaskCount
    ? styles.taskCountText
    : isClickable
      ? styles.clickableText
      : isHighlighted
        ? styles.highlightedText
        : styles.greetingText;

  return (
    <View style={styles.wordContainer}>
      <Animated.View style={animatedStyle}>
        <Text style={textStyle} onPress={onPress}>
          {word}
        </Text>
      </Animated.View>
      <Animated.View
        style={[styles.wordBlurOverlay, blurStyle]}
        pointerEvents="none"
      >
        <BlurView intensity={8} tint="default" style={styles.blurView} />
      </Animated.View>
    </View>
  );
};

export const TodayTasksOverview: React.FC<TodayTasksOverviewProps> = ({
  selectedDate,
}) => {
  const { tasks, completionsByKey, updateTaskStatusForDate } = useTasks();
  const { getMoodForDate, todayMood } = useMood();
  const { theme } = useUnistyles();
  const { name: userName } = useUserName();
  const [currentDate, setCurrentDate] = useState(
    selectedDate || new Date().toISOString().split("T")[0]
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [dateMood, setDateMood] = useState<any>(null);
  const sheetRef = useRef<TrueSheet>(null);

  // When selectedDate changes, trigger animation restart
  useEffect(() => {
    if (selectedDate && selectedDate !== currentDate) {
      setCurrentDate(selectedDate);
      setAnimationKey((prev) => prev + 1);
    }
  }, [selectedDate, currentDate]);

  // Load mood for current date
  useEffect(() => {
    const loadMood = async () => {
      const today = new Date().toISOString().split("T")[0];
      if (currentDate === today) {
        setDateMood(todayMood);
      } else {
        const mood = await getMoodForDate(currentDate);
        setDateMood(mood);
      }
    };
    loadMood();
  }, [currentDate, todayMood, getMoodForDate]);

  // Filter tasks for selected date - memoized to prevent unnecessary recalculations
  const dateTasks = useMemo(
    () => tasks.filter((task) => isTaskScheduledForDate(task, currentDate)),
    [tasks, currentDate]
  );

  const incompleteTasks = useMemo(
    () =>
      dateTasks.filter(
        (task) =>
          getTaskStatusForDate(task, currentDate, completionsByKey) === "todo"
      ),
    [dateTasks, currentDate, completionsByKey]
  );

  const remainingTasks = incompleteTasks.length;

  // Generate greeting and mood messages
  const generateMessages = () => {
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
    const isToday = diffDays === 0;

    // Generate combined message with mood integrated
    let taskMessage = null;
    let moodMessage = null;

    if (remainingTasks === 0 && totalTasks > 0) {
      if (diffDays === 0) {
        taskMessage = {
          text: `${greeting},`,
          highlighted: userName || "there",
          afterText: `! All`,
          highlighted2: "tasks",
          afterText2: `completed for today.`,
        };
      } else {
        taskMessage = {
          text: ``,
          highlighted: userName || "there",
          afterText: `, all`,
          highlighted2: "tasks",
          afterText2: `were completed ${datePhrase}.`,
        };
      }
    } else if (remainingTasks === 0) {
      if (diffDays === 0) {
        taskMessage = {
          text: `${greeting},`,
          highlighted: userName || "there",
          afterText: `! No`,
          highlighted2: "tasks",
          afterText2: `scheduled for today.`,
        };
      } else {
        taskMessage = {
          text: ``,
          highlighted: userName || "there",
          afterText: `, you have no`,
          highlighted2: "tasks",
          afterText2: `scheduled ${datePhrase}.`,
        };
      }
    } else {
      const taskText = remainingTasks === 1 ? "task" : "tasks";
      if (diffDays === 0) {
        taskMessage = {
          text: `${greeting},`,
          highlighted: userName || "there",
          afterText: `! You have`,
          taskCount: `${remainingTasks} ${taskText}`,
          afterText2: `remaining today.`,
        };
      } else {
        taskMessage = {
          text: ``,
          highlighted: userName || "there",
          afterText: `, you have`,
          taskCount: `${remainingTasks} ${taskText}`,
          afterText2: `${datePhrase}.`,
        };
      }
    }

    // Add mood message naturally after task message
    if (isToday && dateMood) {
      const mood = dateMood.mood;

      // Different messages based on mood
      if (mood === "Productive") {
        moodMessage = {
          highlighted: "Keep up the great work!",
          afterText: "You're crushing it today! 💪",
        };
      } else if (mood === "Relaxed") {
        moodMessage = {
          highlighted: "Taking it easy",
          afterText: "today? Perfect time to recharge. 🌿",
        };
      } else if (mood === "Stressed") {
        moodMessage = {
          text: "I see you're having a tough day.",
          highlighted: "Take it one step at a time.",
          afterText: "🫂",
        };
      } else if (mood === "Anxious") {
        moodMessage = {
          text: "I'm here with you.",
          highlighted: "What's on your mind?",
          afterText: "💙",
        };
      }
    } else if (isToday && !dateMood) {
      // Prompt to capture mood
      moodMessage = {
        text: "Please",
        clickableText: "capture your mood",
        afterText: "to get personalized insights.",
      };
    }

    return { moodMessage, taskMessage };
  };

  // Split text into words for animation - memoized to prevent infinite loops
  const wordSegments = useMemo(() => {
    const { moodMessage, taskMessage } = generateMessages();
    const segments: WordSegment[] = [];

    // Add task message first
    if (taskMessage) {
      // Add text before first highlight
      if (taskMessage.text) {
        const words = taskMessage.text.trim().split(" ");
        words.forEach((word, index) => {
          if (word) {
            segments.push({ text: word });
            if (index < words.length - 1) {
              segments.push({ text: " " });
            }
          }
        });
      }

      // Add first highlighted word
      if (taskMessage.highlighted) {
        if (segments.length > 0) segments.push({ text: " " });
        segments.push({
          text: taskMessage.highlighted,
          isHighlighted: true,
        });
      }

      // Add text after first highlight
      if (taskMessage.afterText) {
        const words = taskMessage.afterText.trim().split(" ");
        words.forEach((word, index) => {
          if (word) {
            if (
              segments.length > 0 &&
              segments[segments.length - 1].text !== " "
            ) {
              segments.push({ text: " " });
            }
            segments.push({ text: word });
          }
        });
      }

      // Add task count
      if (taskMessage.taskCount) {
        if (segments.length > 0 && segments[segments.length - 1].text !== " ") {
          segments.push({ text: " " });
        }
        segments.push({ text: taskMessage.taskCount, isTaskCount: true });
      }

      // Add second highlighted word
      if (taskMessage.highlighted2) {
        if (segments.length > 0 && segments[segments.length - 1].text !== " ") {
          segments.push({ text: " " });
        }
        segments.push({
          text: taskMessage.highlighted2,
          isHighlighted: true,
        });
      }

      // Add text after second highlight
      if (taskMessage.afterText2) {
        const words = taskMessage.afterText2.trim().split(" ");
        words.forEach((word, index) => {
          if (word) {
            if (
              segments.length > 0 &&
              segments[segments.length - 1].text !== " "
            ) {
              segments.push({ text: " " });
            }
            segments.push({ text: word });
          }
        });
      }
    }

    // Add mood message (continue on same line)
    if (moodMessage) {
      if (moodMessage.text) {
        const words = moodMessage.text.trim().split(" ");
        words.forEach((word) => {
          if (word) {
            if (
              segments.length > 0 &&
              segments[segments.length - 1].text !== " "
            ) {
              segments.push({ text: " " });
            }
            segments.push({ text: word });
          }
        });
      }

      if (moodMessage.highlighted) {
        if (segments.length > 0 && segments[segments.length - 1].text !== " ") {
          segments.push({ text: " " });
        }
        segments.push({
          text: moodMessage.highlighted,
          isHighlighted: true,
        });
      }

      if (moodMessage.clickableText) {
        if (segments.length > 0 && segments[segments.length - 1].text !== " ") {
          segments.push({ text: " " });
        }
        segments.push({ text: moodMessage.clickableText, isClickable: true });
      }

      if (moodMessage.afterText) {
        const words = moodMessage.afterText.trim().split(" ");
        words.forEach((word) => {
          if (word) {
            if (
              segments.length > 0 &&
              segments[segments.length - 1].text !== " "
            ) {
              segments.push({ text: " " });
            }
            segments.push({ text: word });
          }
        });
      }
    }

    return segments;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, remainingTasks, dateTasks.length, dateMood, userName]);

  const handleMoodPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    TrueSheet.present("mood");
  };

  const handleMarkAsDone = async (taskId: string) => {
    const todayKey = new Date().toISOString().split("T")[0];
    if (currentDate > todayKey) {
      toast.info("You can't complete future tasks yet.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateTaskStatusForDate(taskId, currentDate, "done");
  };

  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <Text
          style={styles.greetingText}
          key={animationKey}
          numberOfLines={undefined}
        >
          {wordSegments.map((segment, index) => {
            const textStyle = segment.isTaskCount
              ? styles.taskCountText
              : segment.isClickable
                ? styles.clickableText
                : segment.isHighlighted
                  ? styles.highlightedText
                  : styles.greetingText;

            return (
              <Text
                key={`${animationKey}-${index}`}
                style={textStyle}
                onPress={segment.isClickable ? handleMoodPress : undefined}
              >
                {segment.text}
              </Text>
            );
          })}
        </Text>
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
        style={styles.sheetContainer}
      >
        <Text style={styles.sheetTitle}>Your Tasks</Text>
        <View style={styles.tasksList}>
          {incompleteTasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <View style={styles.taskItemContent}>
                {task.icon && (
                  <View style={styles.taskIconContainer}>
                    <Lucide name={task.icon as any} size={20} color={theme.colors.text} />
                  </View>
                )}
                <Text
                  style={[styles.taskItemTitle, task.icon && styles.taskItemTitleWithIcon]}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
              </View>
              <TaskCheckbox
                task={task}
                dateKey={currentDate}
                onToggle={() => sheetRef.current?.dismiss()}
              />
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
          <Text style={styles.doneButtonText}>Mark first as Done</Text>
        </TouchableOpacity>
      </TrueSheet>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    minHeight: 180,
    paddingVertical: 20,
    paddingHorizontal: 0,
  },
  greetingContainer: {
    position: "relative",
    flexShrink: 1,
    width: "100%",
  },
  textRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
  },
  wordContainer: {
    position: "relative",
    flexShrink: 0,
  },
  greetingText: {
    fontFamily: theme.fonts.primary,
    fontSize: 28,
    color: theme.colors.textSecondary,
    lineHeight: 36,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  taskCountText: {
    fontFamily: theme.fonts.primary,
    fontSize: 28,
    color: theme.colors.text,
    fontWeight: "600",
    lineHeight: 36,
  },
  clickableText: {
    fontFamily: theme.fonts.primary,
    fontSize: 28,
    color: theme.colors.text,
    fontWeight: "600",
    lineHeight: 36,
    textDecorationLine: "underline",
  },
  highlightedText: {
    fontFamily: theme.fonts.primary,
    fontSize: 28,
    color: theme.colors.text,
    fontWeight: "600",
    lineHeight: 36,
  },
  wordBlurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    fontFamily: theme.fonts.primary,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: 20,
  },
  tasksList: {
    gap: 12,
    marginBottom: 24,
  },
  taskItem: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  taskItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  taskItemTitle: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
  },
  taskItemTitleWithIcon: {
    flex: 1,
  },
  doneButton: {
    backgroundColor: theme.colors.buttonPrimary,
    paddingVertical: 20,
    borderRadius: theme.borderRadius.pill,
    alignItems: "center",
  },
  doneButtonText: {
    fontFamily: theme.fonts.primary,
    fontSize: 20,
    color: theme.colors.buttonPrimaryText,
  },
}));
