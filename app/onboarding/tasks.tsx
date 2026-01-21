import { ScrollView, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { GlassView } from "expo-glass-effect";
import { SquircleButton } from "expo-squircle-view";
import { Lucide } from "@react-native-vector-icons/lucide";
import { router } from "expo-router";
import { useTasks } from "@/entities/task";
import { trackEvent, AnalyticsEvents } from "@/shared/lib/analytics";

const SUGGESTED_TASKS = [
  {
    id: "deep-work",
    title: "Deep work block",
    icon: "target",
  },
  {
    id: "move-body",
    title: "Move your body",
    icon: "dumbbell",
  },
  {
    id: "reach-out",
    title: "Reach out to someone",
    icon: "message-circle",
  },
  {
    id: "plan-tomorrow",
    title: "Plan tomorrow",
    icon: "calendar",
  },
  {
    id: "read-10",
    title: "Read 10 pages",
    icon: "book-open",
  },
];

export default function OnboardingTasksScreen() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const { createTask, tasks } = useTasks();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const nextEnabled = selectedIds.length > 0 && !isSaving;

  const selectedTasks = useMemo(
    () => SUGGESTED_TASKS.filter((task) => selectedIds.includes(task.id)),
    [selectedIds]
  );

  const toggleTask = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleContinue = useCallback(async () => {
    if (!nextEnabled) return;
    setIsSaving(true);
    const todayKey = new Date().toISOString().split("T")[0];

    try {
      for (const task of selectedTasks) {
        const exists = tasks.some(
          (existing) =>
            existing.date === todayKey && existing.title === task.title
        );
        if (exists) continue;
        await createTask({
          title: task.title,
          date: todayKey,
          icon: task.icon,
          category: "today",
        });
      }

      // Track tasks selected event
      trackEvent(AnalyticsEvents.TASKS_SELECTED, {
        count: selectedTasks.length,
        task_names: selectedTasks.map((t) => t.title),
      });

      router.push("/onboarding/mood");
    } finally {
      setIsSaving(false);
    }
  }, [createTask, nextEnabled, selectedTasks, tasks]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <StatusBar style={theme.colors.text === "#FFFFFF" ? "light" : "dark"} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          What matters today?
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Pick a few to kickstart your list.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.options}
        showsVerticalScrollIndicator={false}
      >
        {SUGGESTED_TASKS.map((task) => {
          const isSelected = selectedIds.includes(task.id);
          return (
            <SquircleButton
              key={task.id}
              cornerSmoothing={100}
              borderRadius={16}
              preserveSmoothing
              onPress={() => toggleTask(task.id)}
              style={[
                styles.option,
                {
                  borderColor: isSelected
                    ? theme.colors.text
                    : theme.colors.border,
                  backgroundColor: isSelected
                    ? theme.colors.backgroundSecondary
                    : theme.colors.background,
                },
              ]}
            >
              <View style={styles.optionInner}>
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: theme.colors.backgroundQuaternary },
                  ]}
                >
                  <Lucide
                    name={task.icon as any}
                    size={18}
                    color={theme.colors.text}
                  />
                </View>
                <Text style={[styles.optionText, { color: theme.colors.text }]}>
                  {task.title}
                </Text>
                <View style={styles.optionCheck}>
                  {isSelected ? (
                    <Lucide
                      name="check"
                      size={18}
                      color={theme.colors.text}
                    />
                  ) : null}
                </View>
              </View>
            </SquircleButton>
          );
        })}
      </ScrollView>

      <GlassView
        isInteractive
        glassEffectStyle="clear"
        onTouchEnd={handleContinue}
        style={[
          styles.nextButton,
          {
            backgroundColor: nextEnabled
              ? theme.colors.buttonPrimary
              : theme.colors.backgroundQuaternary,
          },
        ]}
      >
        <Text
          style={[
            styles.nextButtonText,
            {
              color: nextEnabled
                ? theme.colors.buttonPrimaryText
                : theme.colors.textSecondary,
            },
          ]}
        >
          {isSaving ? "Creating..." : "Continue"}
        </Text>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: theme.fonts.primary,
    fontSize: 28,
  },
  subtitle: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    marginTop: 8,
  },
  options: {
    gap: 12,
    paddingBottom: 12,
  },
  scroll: {
    flex: 1,
  },
  option: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    fontFamily: theme.fonts.primary,
    fontSize: 16,
  },
  optionCheck: {
    width: 22,
    alignItems: "flex-end",
  },
  nextButton: {
    marginTop: "auto",
    borderRadius: 999,
    paddingVertical: 25,
    alignItems: "center",
  },
  nextButtonText: {
    fontFamily: theme.fonts.primary,
    fontSize: 22,
  },
}));
