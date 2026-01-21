import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Lucide } from "@react-native-vector-icons/lucide";
import { Layout } from "@/shared/ui";
import {
  getTaskStatusForDate,
  isTaskScheduledForDate,
  useTasks,
} from "@/entities/task";
import { ProgressUp } from "@/shared/assets";
import { SquircleView } from "expo-squircle-view";
import * as Haptics from "expo-haptics";
import * as DropdownMenu from "zeego/dropdown-menu";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DAYS_COUNT = 10;
const BAR_GAP = 8;
const CHART_PADDING = 12;
const BAR_MIN_HEIGHT = 18;
const BAR_MAX_HEIGHT = 120;

type DayEntry = {
  date: Date;
  key: string;
  label: string;
};

export default function Insights() {
  const { theme } = useUnistyles();
  const { top, bottom } = useSafeAreaInsets();
  const [selectedMonthIndex, setSelectedMonthIndex] = React.useState(0);

  const months = React.useMemo(() => {
    const list: { label: string; monthDate: Date }[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i += 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push({
        label: date.toLocaleString("en-US", { month: "long" }),
        monthDate: date,
      });
    }
    return list;
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
      style={{
        backgroundColor: theme.colors.background,
      }}
      contentInset={{ bottom: 0, left: 0, right: 0 }}
      contentContainerStyle={{
        paddingBottom: bottom,
        backgroundColor: theme.colors.background,
      }}
    >
      <ProductivityCard
        months={months}
        selectedMonthIndex={selectedMonthIndex}
        onSelectMonth={setSelectedMonthIndex}
      />
      <MoodPatternCard
        months={months}
        selectedMonthIndex={selectedMonthIndex}
        onSelectMonth={setSelectedMonthIndex}
      />
    </ScrollView>
  );
}

type MonthPickerProps = {
  months: { label: string; monthDate: Date }[];
  selectedMonthIndex: number;
  onSelectMonth: (index: number) => void;
};

const ProductivityCard = ({
  months,
  selectedMonthIndex,
  onSelectMonth,
}: MonthPickerProps) => {
  const { theme } = useUnistyles();
  const { tasks, completionsByKey } = useTasks();
  const [chartWidth, setChartWidth] = React.useState(0);
  const [selectedIndex, setSelectedIndex] = React.useState(DAYS_COUNT - 1);

  const introProgress = useSharedValue(0);
  const selectedIndexSv = useSharedValue(DAYS_COUNT - 1);

  React.useEffect(() => {
    introProgress.value = withTiming(1, {
      duration: 650,
      easing: Easing.out(Easing.exp),
    });
  }, [introProgress]);

  React.useEffect(() => {
    selectedIndexSv.value = withSpring(selectedIndex);
  }, [selectedIndex, selectedIndexSv]);

  const days = React.useMemo<DayEntry[]>(() => {
    const entries: DayEntry[] = [];
    const today = new Date();
    const selectedMonth = months[selectedMonthIndex]?.monthDate ?? today;
    const endDate =
      selectedMonth.getMonth() === today.getMonth() &&
      selectedMonth.getFullYear() === today.getFullYear()
        ? today
        : new Date(
            selectedMonth.getFullYear(),
            selectedMonth.getMonth() + 1,
            0
          );
    for (let i = DAYS_COUNT - 1; i >= 0; i -= 1) {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      entries.push({
        date,
        key,
        label: String(date.getDate()),
      });
    }
    return entries;
  }, [months, selectedMonthIndex]);

  const dayStats = React.useMemo(() => {
    return days.map((day) => {
      const dayTasks = tasks.filter((task) =>
        isTaskScheduledForDate(task, day.key)
      );
      const completed = dayTasks.filter(
        (task) =>
          getTaskStatusForDate(task, day.key, completionsByKey) === "done"
      ).length;
      const total = dayTasks.length;
      const rate = total > 0 ? completed / total : 0;
      return { completed, total, rate };
    });
  }, [days, tasks, completionsByKey]);

  const selectedStats = dayStats[selectedIndex] ?? {
    completed: 0,
    total: 0,
    rate: 0,
  };

  const barWidth =
    chartWidth > 0
      ? (chartWidth - CHART_PADDING * 2 - BAR_GAP * (DAYS_COUNT - 1)) /
        DAYS_COUNT
      : 0;

  React.useEffect(() => {
    setSelectedIndex(DAYS_COUNT - 1);
  }, [selectedMonthIndex]);

  const selectedDate = days[selectedIndex]?.date ?? new Date();
  const monthLabel =
    months[selectedMonthIndex]?.label ??
    selectedDate.toLocaleString("en-US", { month: "long" });
  const productivityPercent = Math.round(selectedStats.rate * 100);

  return (
    <SquircleView
      cornerSmoothing={80}
      borderRadius={25}
      preserveSmoothing
      style={[
        styles.card,
        { backgroundColor: theme.colors.backgroundTertiary },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <ProgressUp size={20} color={theme.colors.textSuccess} />
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Productivity
          </Text>
        </View>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <View style={styles.monthRow}>
              <Text
                style={[
                  styles.monthText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {monthLabel}
              </Text>
              <Lucide
                name="chevron-down"
                size={16}
                color={theme.colors.textSecondary}
              />
            </View>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            loop={false}
            alignOffset={0}
            avoidCollisions
            collisionPadding={8}
          >
            {months.map((month, index) => (
              <DropdownMenu.CheckboxItem
                key={month.label}
                value={selectedMonthIndex === index ? "on" : "off"}
                onValueChange={() => {
                  onSelectMonth(index);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <DropdownMenu.ItemIndicator />
                <DropdownMenu.ItemTitle>{month.label}</DropdownMenu.ItemTitle>
              </DropdownMenu.CheckboxItem>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </View>

      <View style={styles.statsRow}>
        <View>
          <Text style={[styles.statsNumber, { color: theme.colors.text }]}>
            {selectedStats.completed}
          </Text>
          <Text
            style={[styles.statsLabel, { color: theme.colors.textSecondary }]}
          >
            tasks done
          </Text>
        </View>
        <View>
          <Text style={[styles.statsNumber, { color: theme.colors.text }]}>
            {productivityPercent}%
          </Text>
          <Text
            style={[styles.statsLabel, { color: theme.colors.textSecondary }]}
          >
            productivity
          </Text>
        </View>
      </View>

      <View
        style={styles.chart}
        onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
      >
        <View style={styles.barsRow}>
          {days.map((day, index) => (
            <DayBar
              key={day.key}
              index={index}
              label={day.label}
              rate={dayStats[index]?.rate ?? 0}
              barWidth={barWidth}
              selectedIndex={selectedIndex}
              onPress={() => {
                setSelectedIndex(index);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            />
          ))}
        </View>
      </View>
    </SquircleView>
  );
};

const MoodPatternCard = ({
  months,
  selectedMonthIndex,
  onSelectMonth,
}: MonthPickerProps) => {
  const { theme } = useUnistyles();
  const { tasks } = useTasks();

  const monthRange = React.useMemo(() => {
    const today = new Date();
    const selectedMonth = months[selectedMonthIndex]?.monthDate ?? today;
    const start = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(),
      1
    );
    const end = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0
    );
    return { start, end };
  }, [months, selectedMonthIndex]);

  const highlightStats = React.useMemo(() => {
    const stats = new Map<string, { completed: number; total: number }>();
    tasks.forEach((task) => {
      const date = new Date(task.date);
      if (date < monthRange.start || date > monthRange.end) {
        return;
      }
      const entry = stats.get(task.date) ?? { completed: 0, total: 0 };
      entry.total += 1;
      if (task.status === "done") {
        entry.completed += 1;
      }
      stats.set(task.date, entry);
    });

    const days = Array.from(stats.entries());
    if (!days.length) {
      return null;
    }

    const best = days.reduce((current, next) => {
      if (next[1].completed > current[1].completed) return next;
      if (next[1].completed === current[1].completed) {
        return next[1].total > current[1].total ? next : current;
      }
      return current;
    }, days[0]);

    const worst = days.reduce((current, next) => {
      if (next[1].completed < current[1].completed) return next;
      if (next[1].completed === current[1].completed) {
        return next[1].total < current[1].total ? next : current;
      }
      return current;
    }, days[0]);

    return { best, worst };
  }, [monthRange.end, monthRange.start, tasks]);

  const bestDayLabel = highlightStats
    ? new Date(highlightStats.best[0]).toLocaleDateString("en-US", {
        weekday: "long",
      })
    : "—";
  const worstDayLabel = highlightStats
    ? new Date(highlightStats.worst[0]).toLocaleDateString("en-US", {
        weekday: "long",
      })
    : "—";
  const bestCount = highlightStats?.best[1].completed ?? 0;
  const worstCount = highlightStats?.worst[1].completed ?? 0;
  const bestTotal = highlightStats?.best[1].total ?? 0;
  const worstTotal = highlightStats?.worst[1].total ?? 0;
  const bestRate =
    bestTotal > 0 ? Math.round((bestCount / bestTotal) * 100) : 0;
  const worstRate =
    worstTotal > 0 ? Math.round((worstCount / worstTotal) * 100) : 0;
  const monthLabel =
    months[selectedMonthIndex]?.label ??
    new Date().toLocaleString("en-US", { month: "long" });
  const bestSummary = highlightStats
    ? `On ${bestDayLabel} you completed ${bestCount} of ${bestTotal} tasks (${bestRate}%). That's your strongest day in ${monthLabel}.`
    : `No tasks yet for ${monthLabel}. Add a few to unlock your best day.`;
  const worstSummary = highlightStats
    ? `On ${worstDayLabel} you completed ${worstCount} of ${worstTotal} tasks (${worstRate}%). That was the most challenging day.`
    : `No tough day data yet for ${monthLabel}.`;
  const overviewSummary = highlightStats
    ? `You finished ${
        bestCount - worstCount >= 0
          ? bestCount - worstCount
          : Math.abs(bestCount - worstCount)
      } ${
        bestCount >= worstCount ? "more" : "fewer"
      } tasks on ${bestDayLabel} than on ${worstDayLabel}. Protect your best day and lighten the toughest.`
    : `Complete tasks on different days to generate a personalized overview.`;

  return (
    <View style={styles.highlightsSection}>
      <View
        style={[
          styles.cardHeader,
          { justifyContent: "flex-end", marginTop: 10, marginHorizontal: 20 },
        ]}
      >
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <View style={styles.monthRow}>
              <Text
                style={[
                  styles.monthText,
                  { color: theme.colors.textSecondary, fontSize: 18 },
                ]}
              >
                {monthLabel}
              </Text>
              <Lucide
                name="chevron-down"
                size={16}
                color={theme.colors.textSecondary}
              />
            </View>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            loop={false}
            alignOffset={0}
            avoidCollisions
            collisionPadding={8}
          >
            {months.map((month, index) => (
              <DropdownMenu.CheckboxItem
                key={month.label}
                value={selectedMonthIndex === index ? "on" : "off"}
                onValueChange={() => {
                  onSelectMonth(index);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <DropdownMenu.ItemIndicator />
                <DropdownMenu.ItemTitle>{month.label}</DropdownMenu.ItemTitle>
              </DropdownMenu.CheckboxItem>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.highlightsRow}
        pagingEnabled
      >
        <SquircleView
          cornerSmoothing={80}
          borderRadius={25}
          preserveSmoothing
          style={[
            styles.highlightCard,
            styles.highlightCardPrimary,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text style={[styles.highlightTitle, { color: theme.colors.text }]}>
            Best day
          </Text>
          <Text style={[styles.highlightValue, { color: theme.colors.text }]}>
            {bestDayLabel}
          </Text>
          <Text
            style={[
              styles.highlightBody,
              { color: theme.colors.textSecondary },
            ]}
          >
            {bestSummary}
          </Text>
        </SquircleView>
        <SquircleView
          cornerSmoothing={80}
          borderRadius={25}
          preserveSmoothing
          style={[
            styles.highlightCard,
            styles.highlightCardShifted,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text style={[styles.highlightTitle, { color: theme.colors.text }]}>
            Toughest day
          </Text>
          <Text style={[styles.highlightValue, { color: theme.colors.text }]}>
            {worstDayLabel}
          </Text>
          <Text
            style={[
              styles.highlightBody,
              { color: theme.colors.textSecondary },
            ]}
          >
            {worstSummary}
          </Text>
        </SquircleView>
        <SquircleView
          cornerSmoothing={80}
          borderRadius={25}
          preserveSmoothing
          style={[
            styles.highlightCard,
            styles.highlightCardCompact,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text style={[styles.highlightTitle, { color: theme.colors.text }]}>
            Overview
          </Text>
          <Text
            style={[
              styles.highlightBody,
              { color: theme.colors.textSecondary },
            ]}
          >
            {overviewSummary}
          </Text>
        </SquircleView>
      </ScrollView>
    </View>
  );
};

type DayBarProps = {
  index: number;
  label: string;
  rate: number;
  barWidth: number;
  selectedIndex: number;
  onPress: () => void;
};

const DayBar = ({
  index,
  label,
  rate,
  barWidth,
  selectedIndex,
  onPress,
}: DayBarProps) => {
  const { theme } = useUnistyles();
  const introProgress = useSharedValue(0);
  const selectedIndexSv = useSharedValue(selectedIndex);

  React.useEffect(() => {
    introProgress.value = withTiming(1, {
      duration: 650,
      easing: Easing.out(Easing.exp),
    });
  }, [introProgress]);

  React.useEffect(() => {
    selectedIndexSv.value = withSpring(selectedIndex);
  }, [selectedIndex, selectedIndexSv]);

  const barAnimatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(selectedIndexSv.value - index);
    const focus = interpolate(distance, [0, 1], [1, 0], Extrapolate.CLAMP);
    const targetHeight =
      BAR_MIN_HEIGHT + (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT) * rate;
    const height =
      BAR_MIN_HEIGHT + (targetHeight - BAR_MIN_HEIGHT) * introProgress.value;
    return {
      height,
      backgroundColor: interpolateColor(
        focus,
        [0, 1],
        [theme.colors.backgroundQuaternary, theme.colors.textSuccess]
      ),
      transform: [{ translateY: -6 * focus }],
      shadowOpacity: 0.3 * focus,
      elevation: 6 * focus,
    };
  }, [rate, theme.colors.backgroundQuaternary, theme.colors.textSuccess]);

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(selectedIndexSv.value - index);
    const focus = interpolate(distance, [0, 1], [1, 0], Extrapolate.CLAMP);
    return {
      color: interpolateColor(
        focus,
        [0, 1],
        [theme.colors.textSecondary, theme.colors.text]
      ),
    };
  }, [theme.colors.text, theme.colors.textSecondary]);

  const dotAnimatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(selectedIndexSv.value - index);
    const focus = interpolate(distance, [0, 1], [1, 0], Extrapolate.CLAMP);
    return {
      opacity: focus,
      transform: [{ scale: 0.8 + focus * 0.4 }],
    };
  }, []);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.barPressable,
        { width: barWidth, height: BAR_MAX_HEIGHT + 20 },
      ]}
    >
      <Animated.View
        style={[
          styles.bar,
          {
            borderRadius: 15,
            shadowColor: theme.colors.textSuccess,
          },
          barAnimatedStyle,
        ]}
      />
      <Animated.Text style={[styles.dayLabel, labelAnimatedStyle]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  layout: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: rt.insets.top,
    paddingBottom: rt.insets.bottom,
  },
  card: {
    borderRadius: 28,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontFamily: theme.fonts.primary,
    fontSize: 18,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  monthText: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 18,
  },
  statsNumber: {
    fontFamily: theme.fonts.primary,
    fontSize: 36,
  },
  statsLabel: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
    marginTop: 4,
  },
  highlightsSection: {
    marginTop: 12,
  },
  highlightsRow: {
    flexDirection: "row",
    gap: 18,
    paddingVertical: 18,
    paddingRight: 24,
    marginHorizontal: 20,
  },
  highlightCard: {
    width: 260,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 190,
  },
  highlightCardPrimary: {
    transform: [{ rotate: "-1.5deg" }],
  },
  highlightCardShifted: {
    marginTop: 24,
    transform: [{ rotate: "1.2deg" }],
  },
  highlightCardCompact: {
    marginTop: 10,
    transform: [{ rotate: "-0.8deg" }],
  },
  highlightTitle: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
  },
  highlightValue: {
    fontFamily: theme.fonts.primary,
    fontSize: 30,
    marginTop: 8,
  },
  highlightBody: {
    fontFamily: theme.fonts.primary,
    fontSize: 18,
    marginTop: 10,
  },
  chart: {
    marginTop: 18,
    paddingTop: 24,
    paddingHorizontal: CHART_PADDING,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: BAR_GAP,
  },
  barPressable: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "visible",
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  dayLabel: {
    marginTop: 8,
    fontFamily: theme.fonts.primary,
    fontSize: 12,
  },
}));
