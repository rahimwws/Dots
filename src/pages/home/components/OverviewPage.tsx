import React from "react";
import { Animated, Text, View } from "react-native";
import { TextWithIcons } from "@/ui/TextWithIcons";
import { FingerSvg, ProgressUp } from "@/shared/assets";
import { HomeCalendar } from "@/widgets/home-calendar";
import { Divider, Host } from "@expo/ui/swift-ui";
import { Layout } from "@/shared/ui";
import { ShimmerText } from "./ShimmerText";
import { TodayTasksOverview } from "./TodayTasksOverview";
import { GlassView } from "expo-glass-effect";
import { router } from "expo-router";
import {
  getTaskStatusForDate,
  isTaskScheduledForDate,
  useTasks,
} from "@/entities/task";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useStreak } from "@/entities/streak";
import { useUserName } from "@/entities/user";

type OverviewPageProps = {
  arrowOffset: Animated.Value;
};

export const OverviewPage = ({ arrowOffset }: OverviewPageProps) => {
  const { theme } = useUnistyles();
  const { tasks, completionsByKey } = useTasks();
  const { currentStreak } = useStreak();
  const [selectedDate, setSelectedDate] = React.useState<string | undefined>();

  const handleDatePress = (dateKey: string) => {
    setSelectedDate(dateKey);
  };

  const progressByDate = React.useMemo(() => {
    const progress: Record<
      string,
      { completed: number; total?: number; color?: string }
    > = {};

    const today = new Date();
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = new Date(Date.UTC(year, month, day))
        .toISOString()
        .slice(0, 10);
      const dayTasks = tasks.filter((task) =>
        isTaskScheduledForDate(task, dateKey)
      );

      if (!dayTasks.length) {
        continue;
      }

      progress[dateKey] = {
        total: dayTasks.length,
        completed: dayTasks.filter(
          (task) =>
            getTaskStatusForDate(task, dateKey, completionsByKey) === "done"
        ).length,
      };
    }

    return progress;
  }, [tasks, completionsByKey]);
  const { name: userName } = useUserName();

  return (
    <Layout includeTopInset={false}>
      <GlassView
        style={styles.profileButton}
        isInteractive
        glassEffectStyle="clear"
        onTouchStart={() => {
          router.navigate("/profile");
        }}
      >
        <Text style={styles.profileButtonText}>{userName?.charAt(0).toUpperCase()}.</Text>
      </GlassView>

      <View style={styles.streakContainer}>
        <Text style={styles.streakNumber}>{currentStreak}</Text>
        <Text style={styles.streakText}>
          {currentStreak === 1 ? " day streak" : "days streak"}
        </Text>
      </View>

      <View style={styles.divider} />

      <TodayTasksOverview selectedDate={selectedDate} />

      <HomeCalendar
        progressByDate={progressByDate}
        onDatePress={handleDatePress}
        selectedDate={selectedDate}
      />

      <View
        style={{
          alignItems: "center",
          marginTop: 40,
        }}
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: arrowOffset.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["-40deg", "-35deg"],
                }),
              },
            ],
          }}
        >
          <FingerSvg color={theme.colors.textHint} size={20} />
        </Animated.View>
        <ShimmerText />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create((theme) => ({
  profileButton: {
    position: "absolute",
    right: 20,
    zIndex: 10,
    height: 50,
    width: 50,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.buttonPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  profileButtonText: {
    fontFamily: theme.fonts.primary,
    fontSize: 22,
    color: theme.colors.textInverse,
  },
  streakContainer: {
    marginTop: -24,
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 2,
  },
  streakNumber: {
    fontFamily: theme.fonts.primary,
    fontSize: 100,
    color: theme.colors.text,
  },
  streakText: {
    fontFamily: theme.fonts.primary,
    fontSize: 38,
    marginBottom: 18,
    color: theme.colors.text,
  },
  tasksContainer: {
    marginTop: 24,
    gap: 10,
  },
  greeting: {
    fontFamily: theme.fonts.primary,
    fontSize: 22,
    color: theme.colors.text,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  taskCountPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.buttonPrimary,
  },
  taskCountText: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    color: theme.colors.buttonPrimaryText,
  },
  summaryText: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    color: theme.colors.text,
  },
  popoverContent: {
    width: 260,
    backgroundColor: theme.colors.background,
    padding: 18,
    borderRadius: theme.borderRadius.lg,
  },
  popoverTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: theme.colors.text,
    marginBottom: 12,
    fontFamily: theme.fonts.primary,
  },
  popoverEmpty: {
    fontSize: 14,
    color: theme.colors.textQuaternary,
    fontFamily: theme.fonts.primary,
  },
  popoverRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 12,
  },
  popoverTask: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.primary,
  },
  popoverStatus: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontFamily: theme.fonts.primary,
  },
}));
