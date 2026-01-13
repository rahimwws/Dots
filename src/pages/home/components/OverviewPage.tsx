import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { TextWithIcons } from "@/ui/TextWithIcons";
import { FingerSvg, ProgressUp } from "@/shared/assets";
import { HomeCalendar } from "@/widgets/home-calendar";
import { Divider, Host } from "@expo/ui/swift-ui";
import { Layout } from "@/shared/ui/Layout";
import { ShimmerText } from "./ShimmerText";
import { TodayTasksOverview } from "./TodayTasksOverview";
import { GlassView } from "expo-glass-effect";
import { router } from "expo-router";
import { TaskStatus, useTasks } from "@/shared/lib/tasks";

type OverviewPageProps = {
  arrowOffset: Animated.Value;
};

export const OverviewPage = ({ arrowOffset }: OverviewPageProps) => {
  const { tasks } = useTasks();
  const [selectedDate, setSelectedDate] = React.useState<string | undefined>();

  const todayKey = React.useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const todayTasks = React.useMemo(
    () => tasks.filter((task) => task.date === todayKey),
    [tasks, todayKey]
  );

  const handleDatePress = (dateKey: string) => {
    setSelectedDate(dateKey);
  };

  const progressByDate = React.useMemo(() => {
    const progress: Record<
      string,
      { completed: number; total?: number; color?: string }
    > = {};

    tasks.forEach((task) => {
      const entry = progress[task.date] ?? { completed: 0, total: 0 };
      entry.total = (entry.total ?? 0) + 1;
      if (task.status === "done") {
        entry.completed += 1;
      }
      progress[task.date] = entry;
    });

    return progress;
  }, [tasks]);

  return (
    <Layout includeTopInset={false}>
      <GlassView
        style={{
          width: 50,
          height: 50,
          borderRadius: 100,
          backgroundColor: "#000",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "flex-end",
        }}
        isInteractive
        glassEffectStyle="clear"
        onTouchStart={() => {
          router.navigate("/profile");
        }}
      >
        <Text style={{ fontFamily: "is-r", fontSize: 22, color: "#fff" }}>
          Ra.
        </Text>
      </GlassView>

      <View
        style={{ flexDirection: "row", alignItems: "flex-end", marginTop: -50 }}
      >
        <Text style={{ fontFamily: "is-r", fontSize: 100, color: "#1F1F1F" }}>
          17
        </Text>
        <Text
          style={{
            fontFamily: "is-r",
            fontSize: 48,
            paddingBottom: 18,
            color: "#1F1F1F",
          }}
        >
          days streak
        </Text>
      </View>

      <Host>
        <Divider />
      </Host>

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
          <FingerSvg color="#9B9B9B" size={20} />
        </Animated.View>
        <ShimmerText />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  tasksContainer: {
    marginTop: 24,
    gap: 10,
  },
  greeting: {
    fontFamily: "is-r",
    fontSize: 22,
    color: "#1F1F1F",
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
    borderRadius: 999,
    backgroundColor: "#1F1F1F",
  },
  taskCountText: {
    fontFamily: "is-r",
    fontSize: 16,
    color: "#FFFFFF",
  },
  summaryText: {
    fontFamily: "is-r",
    fontSize: 16,
    color: "#1F1F1F",
  },
  popoverContent: {
    width: 260,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
  },
  popoverTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F1F1F",
    marginBottom: 12,
    fontFamily: "is-r",
  },
  popoverEmpty: {
    fontSize: 14,
    color: "#9D9D9D",
    fontFamily: "is-r",
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
    color: "#1F1F1F",
    fontFamily: "is-r",
  },
  popoverStatus: {
    fontSize: 12,
    color: "#5A5A5A",
    fontFamily: "is-r",
  },
});
