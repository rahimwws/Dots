import { useTasks } from "@/entities/task";
import { useState, useRef, useEffect, type MutableRefObject } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { DateTimePicker, Host } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { GlassView } from "expo-glass-effect";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useAudioPlayer, AudioModule } from "expo-audio";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { IconPickerSheet } from "@/features/select-icon";
import { Lucide } from "@react-native-vector-icons/lucide";
import { toast } from "@/shared/ui";
import { ShimmerText } from "@/pages/home/components/ShimmerText";
import { SquircleButton } from "expo-squircle-view";
import * as DropdownMenu from "zeego/dropdown-menu";
import {
  getTextModelAvailability,
  toTextGenerationError,
  useLLMSession,
} from "@ratley/react-native-apple-foundation-models";

const AnimatedTouchable = Animated.createAnimatedComponent(SquircleButton);
const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AddTaskScreen() {
  const { theme } = useUnistyles();
  const { height } = useWindowDimensions();
  const { createTask } = useTasks();
  const [taskTitle, setTaskTitle] = useState("");
  const [entryType, setEntryType] = useState<"task" | "habit">("task");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [isAutoSuggestEnabled, setIsAutoSuggestEnabled] = useState(false);
  const [habitRepeatInterval, setHabitRepeatInterval] = useState<
    "daily" | "weekly"
  >("daily");
  const [habitRepeatWeekday, setHabitRepeatWeekday] = useState(
    new Date().getDay()
  );

  const dateSheetRef = useRef<TrueSheet>(null);
  const timeSheetRef = useRef<TrueSheet>(null);
  const iconSheetRef = useRef<TrueSheet>(null);
  const lastTypeTime = useRef<number>(0);
  const typewriterIndex = useRef(0);
  const returnIndex = useRef(0);
  const aiAvailabilityReasonRef = useRef<string | null>(null);
  const autoSuggestTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const lastAutoSuggestSeedRef = useRef<string>("");
  const llmSession = useLLMSession({
    instructions:
      "Return only a single task title. No quotes or explanations.",
  });

  // Audio players for typewriter sounds
  const typewriterPlayers = [
    useAudioPlayer(require("../../assets/sounds/typewriter-click.wav")),
    useAudioPlayer(require("../../assets/sounds/typewriter-click.wav")),
    useAudioPlayer(require("../../assets/sounds/typewriter-click.wav")),
    useAudioPlayer(require("../../assets/sounds/typewriter-click.wav")),
  ];
  const returnPlayers = [
    useAudioPlayer(require("../../assets/sounds/return.wav")),
    useAudioPlayer(require("../../assets/sounds/return.wav")),
    useAudioPlayer(require("../../assets/sounds/return.wav")),
  ];

  // Animated values
  const inputScale = useSharedValue(0.95);
  const addButtonOpacity = useSharedValue(0.5);

  // Configure audio on mount
  useEffect(() => {
    AudioModule.setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
  }, []);
  useEffect(() => {
    return () => {
      if (autoSuggestTimeoutRef.current) {
        clearTimeout(autoSuggestTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    addButtonOpacity.value = withTiming(taskTitle.trim() ? 1 : 0.5, {
      duration: 300,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskTitle]);

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const buildDueAt = (baseDate: Date) => {
    if (!selectedTime) {
      return null;
    }

    const dueDate = new Date(baseDate);
    dueDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    return dueDate.toISOString();
  };

  const handleDateSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
    dateSheetRef.current?.present();
  };

  const handleTimeSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!selectedTime) {
      setSelectedTime(new Date());
    }
    timeSheetRef.current?.present();
  };

  const handleIconSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    iconSheetRef.current?.present();
  };

  const handleIconChange = (iconName: string) => {
    setSelectedIcon(iconName);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dateSheetRef.current?.dismiss();
  };

  const handleTimeChange = (date: Date) => {
    setSelectedTime(date);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAdd = async () => {
    if (!taskTitle.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const taskDate =
      entryType === "task" ? selectedDate || new Date() : new Date();
    const dateString = taskDate.toISOString().split("T")[0];

    await createTask({
      title: taskTitle.trim(),
      date: dateString,
      entryType,
      ...(entryType === "task"
        ? {
          icon: selectedIcon || undefined,
          dueAt: buildDueAt(taskDate) || undefined,
        }
        : {
          dueAt: buildDueAt(taskDate) || undefined,
          repeatInterval: habitRepeatInterval,
          repeatWeekday:
            habitRepeatInterval === "weekly" ? habitRepeatWeekday : undefined,
        }),
    });

    setTaskTitle("");
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedIcon(null);
    setAiSuggestion("");
    toast.success(entryType === "habit" ? "Habit added" : "Task added");
    // router.back();
  };

  const acceptAiSuggestion = () => {
    if (!aiSuggestion.trim()) return;
    setIsGeneratingTitle(false);
    setTaskTitle(aiSuggestion.trim());
    setAiSuggestion("");
  };

  const dismissAiSuggestion = () => {
    setAiSuggestion("");
  };

  const normalizeSuggestion = (raw: string, baseTitle?: string) => {
    const lines = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const candidate = lines.length ? lines[lines.length - 1] : raw;
    let cleaned = candidate.trim().replace(/^["'\\s-]+/, "");
    if (/sorry|cannot assist|can’t assist|can't assist/i.test(cleaned)) {
      return "";
    }
    const lower = cleaned.toLowerCase();
    if (lower.includes("continuation") || lower.includes("suggestion")) {
      const parts = cleaned.split(":");
      if (parts.length > 1) {
        cleaned = parts[parts.length - 1].trim();
      }
    }
    cleaned = cleaned.replace(/^(task\s*title|title)\s*:\s*/i, "");
    cleaned = cleaned.replace(/^["'\\s-]+/, "");
    cleaned = cleaned.replace(/["']+$/, "");
    if (baseTitle) {
      const escapedBase = baseTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const basePrefix = new RegExp(
        `^${escapedBase}[\\s:-]+`,
        "i"
      );
      cleaned = cleaned.replace(basePrefix, "").trim();
    }
    if (!cleaned) return "";
    return cleaned;
  };

  const requestAiSuggestion = async (baseTitle: string) => {
    setIsGeneratingTitle(true);

    try {
      const availability = await getTextModelAvailability();
      if (availability.status !== "available") {
        const reason = availability.reasonCode ?? "unknown";
        if (aiAvailabilityReasonRef.current !== reason) {
          aiAvailabilityReasonRef.current = reason;
          switch (reason) {
            case "deviceNotEligible":
              toast.info("This device doesn't support Apple Intelligence.");
              break;
            case "appleIntelligenceNotEnabled":
              toast.info("Enable Apple Intelligence in Settings to use AI.");
              break;
            case "modelNotReady":
              toast.info("Model is preparing. Try again in a moment.");
              break;
            case "unknown":
            case "unsupported":
            default:
              toast.info("AI isn't available here. Try manual entry.");
              break;
          }
        }
        setAiSuggestion("");
        return;
      }
      aiAvailabilityReasonRef.current = null;

      const text = await llmSession.ask(
        `Rewrite this as a concise task title: "${baseTitle}"`,
        { temperature: 0.2, maxOutputTokens: 24 }
      );

      const suggestion = normalizeSuggestion(text, baseTitle);
      if (!suggestion) {
        setAiSuggestion("");
        return;
      }

      setAiSuggestion(suggestion);
    } catch (error) {
      const err = toTextGenerationError(error);
      if (err?.code) {
        toast.error("AI couldn't generate a suggestion.");
      } else {
        toast.error("Something went wrong with AI.");
      }
      setAiSuggestion("");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const playFromPool = (
    pool: ReturnType<typeof useAudioPlayer>[],
    indexRef: MutableRefObject<number>,
    volume: number
  ) => {
    if (!pool.length) return;
    const player = pool[indexRef.current % pool.length];
    indexRef.current = (indexRef.current + 1) % pool.length;
    player.volume = volume;
    player.seekTo(0);
    player.play();
  };

  const playTypewriterSound = () => {
    playFromPool(typewriterPlayers, typewriterIndex, 0.5);
  };

  const playReturnSound = () => {
    const now = Date.now();
    const MIN_INTERVAL = 10;

    if (now - lastTypeTime.current < MIN_INTERVAL) {
      return;
    }

    lastTypeTime.current = now;

    // Lighter haptic for delete action
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Play return/delete sound
    try {
      playFromPool(returnPlayers, returnIndex, 0.5);
    } catch (error) {
      console.log("Audio error:", error);
    }
  };

  const handleTextChange = (text: string) => {
    if (text.length > taskTitle.length) {
      // Adding characters - play typewriter sound
      playTypewriterSound();
    } else if (text.length < taskTitle.length) {
      // Deleting characters - play return sound
      playReturnSound();
    }
    setTaskTitle(text);
    setAiSuggestion("");

    if (!isAutoSuggestEnabled) {
      if (autoSuggestTimeoutRef.current) {
        clearTimeout(autoSuggestTimeoutRef.current);
      }
      return;
    }

    if (autoSuggestTimeoutRef.current) {
      clearTimeout(autoSuggestTimeoutRef.current);
    }

    autoSuggestTimeoutRef.current = setTimeout(() => {
      if (!isAutoSuggestEnabled || isGeneratingTitle || aiSuggestion) return;
      if (!/\s$/.test(text)) return;
      const baseTitle = text.trim();
      if (!baseTitle) return;
      if (lastAutoSuggestSeedRef.current === baseTitle) return;
      lastAutoSuggestSeedRef.current = baseTitle;
      requestAiSuggestion(baseTitle);
    }, 1000);
  };

  const handleInputFocus = async () => {
    inputScale.value = withSpring(1, {});

    // Override audio session to suppress iOS keyboard clicks
    try {
      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });
    } catch (error) {
      console.log("Focus audio mode error:", error);
    }
  };

  const handleInputBlur = async () => {
    inputScale.value = withSpring(0.95);

    // Restore normal audio session
    try {
      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });
    } catch (error) {
      console.log("Blur audio mode error:", error);
    }
  };

  const handleSubmitEditing = () => {
    playReturnSound();
  };

  const handleAiSuggestionRequest = () => {
    setIsAutoSuggestEnabled((prev) => {
      const next = !prev;
      if (!next && autoSuggestTimeoutRef.current) {
        clearTimeout(autoSuggestTimeoutRef.current);
      }
      return next;
    });
  };

  const handleEntryTypeChange = (nextType: "task" | "habit") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEntryType(nextType);
  };

  const handleHabitRepeatDaily = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHabitRepeatInterval("daily");
  };

  const handleHabitRepeatWeekly = (weekday: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHabitRepeatInterval("weekly");
    setHabitRepeatWeekday(weekday);
  };

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const addButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: addButtonOpacity.value,
  }));

  const habitLabel =
    habitRepeatInterval === "daily"
      ? "Every day"
      : `Every ${WEEKDAY_LABELS[habitRepeatWeekday]}`;
  const inputPlaceholder = entryType === "habit" ? "Habit title" : "Task title";
  const addButtonLabel = entryType === "habit" ? "Add habit" : "Add task";
  const aiSuggestionMeta = `${selectedDate ? formatDate(selectedDate) : "Today"
    }${selectedTime ? ` • ${formatTime(selectedTime)}` : ""}`;

  return (
    <View style={styles.layout}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={-55}
        >
          <View style={styles.content}>
            <View style={styles.typeSelectorsRow}>
              <AnimatedTouchable
                cornerSmoothing={80}
                borderRadius={12}
                preserveSmoothing
                entering={FadeIn.duration(400).delay(50)}
                style={[
                  styles.selectorButton,
                  entryType === "task" && styles.selectorButtonActive,
                ]}
                onPress={() => handleEntryTypeChange("task")}
                activeOpacity={0.7}
              >
                <SymbolView
                  name="checkmark.circle"
                  size={16}
                  tintColor={
                    entryType === "task"
                      ? theme.colors.text
                      : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.selectorText,
                    entryType === "task" && styles.selectorTextActive,
                  ]}
                >
                  Task
                </Text>
              </AnimatedTouchable>

              <AnimatedTouchable
                cornerSmoothing={80}
                borderRadius={12}
                preserveSmoothing
                entering={FadeIn.duration(400).delay(100)}
                style={[
                  styles.selectorButton,
                  entryType === "habit" && styles.selectorButtonActive,
                ]}
                onPress={() => handleEntryTypeChange("habit")}
                activeOpacity={0.7}
              >
                <SymbolView
                  name="repeat"
                  size={16}
                  tintColor={
                    entryType === "habit"
                      ? theme.colors.text
                      : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.selectorText,
                    entryType === "habit" && styles.selectorTextActive,
                  ]}
                >
                  Habit
                </Text>
              </AnimatedTouchable>
              <AnimatedTouchable
                cornerSmoothing={80}
                borderRadius={12}
                preserveSmoothing
                entering={FadeIn.duration(400).delay(400)}
                style={[
                  styles.selectorButton,
                  (aiSuggestion ||
                    isGeneratingTitle ||
                    isAutoSuggestEnabled) &&
                  styles.selectorButtonActive,
                  { position: "absolute", right: 0, top: 0, borderWidth: 0 },
                ]}
                onPress={handleAiSuggestionRequest}
                activeOpacity={0.7}
              >

                <SymbolView
                  name="apple.intelligence"
                  size={24}
                  tintColor={
                    aiSuggestion || isGeneratingTitle || isAutoSuggestEnabled
                      ? theme.colors.accent
                      : theme.colors.textSecondary
                  }
                />

              </AnimatedTouchable>
            </View>

            <Animated.View style={inputAnimatedStyle}>
              <TextInput
                style={styles.titleInput}
                placeholder={inputPlaceholder}
                placeholderTextColor={theme.colors.textTertiary}
                value={taskTitle}
                onChangeText={handleTextChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onSubmitEditing={handleSubmitEditing}
                multiline
                autoFocus
                returnKeyType="done"
                selectionColor={theme.colors.text}
                selectionHandleColor={theme.colors.text}
              />
            </Animated.View>

            <View style={styles.spacer} />

            {aiSuggestion || isGeneratingTitle ? (
              <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                style={styles.aiSuggestionCard}
              >
                <View style={styles.aiSuggestionHeader}>
                  <SymbolView
                    name="apple.intelligence"
                    size={14}
                    tintColor={theme.colors.textSecondary}
                  />
                  <Text style={styles.aiSuggestionHeaderText}>
                    Suggested by Apple Intelligence
                  </Text>
                </View>
                <View style={styles.aiSuggestionBody}>
                  <View style={styles.aiSuggestionText}>
                    {isGeneratingTitle ? (
                      <View style={styles.aiSuggestionShimmer}>
                        <ShimmerText
                          text={[
                            { text: "Generating", bold: false },
                            { text: " suggestion", bold: true },
                          ]}
                        />
                      </View>
                    ) : (
                      <Text style={styles.aiSuggestionTitle}>
                        {aiSuggestion}
                      </Text>
                    )}
                    <Text style={styles.aiSuggestionMeta}>
                      {aiSuggestionMeta}
                    </Text>
                  </View>
                  <View style={styles.aiSuggestionActions}>
                    <AnimatedTouchable
                      cornerSmoothing={80}
                      borderRadius={999}
                      preserveSmoothing
                      style={[
                        styles.aiApplyButton,
                        isGeneratingTitle && styles.aiApplyButtonDisabled,
                      ]}
                      onPress={acceptAiSuggestion}
                      activeOpacity={0.7}
                      disabled={isGeneratingTitle}
                    >
                      <Text style={styles.aiApplyButtonText}>Apply</Text>
                    </AnimatedTouchable>
                    <AnimatedTouchable
                      cornerSmoothing={80}
                      borderRadius={999}
                      preserveSmoothing
                      style={styles.aiDismissButton}
                      onPress={dismissAiSuggestion}
                      activeOpacity={0.7}
                    >
                      <SymbolView
                        name="xmark"
                        size={12}
                        tintColor={theme.colors.textSecondary}
                      />
                    </AnimatedTouchable>
                  </View>
                </View>
              </Animated.View>
            ) : entryType === "task" ? (
              <View style={styles.selectorsRow}>
                <AnimatedTouchable
                  cornerSmoothing={80}
                  borderRadius={12}
                  preserveSmoothing
                  entering={FadeIn.duration(400).delay(100)}
                  style={[
                    styles.selectorButton,
                    selectedDate && styles.selectorButtonActive,
                  ]}
                  onPress={handleDateSelect}
                  activeOpacity={0.7}
                >
                  <SymbolView
                    name="calendar"
                    size={16}
                    tintColor={
                      selectedDate
                        ? theme.colors.text
                        : theme.colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.selectorText,
                      selectedDate && styles.selectorTextActive,
                    ]}
                  >
                    {selectedDate ? formatDate(selectedDate) : "Today"}
                  </Text>
                </AnimatedTouchable>

                <AnimatedTouchable
                  cornerSmoothing={80}
                  borderRadius={12}
                  preserveSmoothing
                  entering={FadeIn.duration(400).delay(200)}
                  style={[
                    styles.selectorButton,
                    selectedTime && styles.selectorButtonActive,
                  ]}
                  onPress={handleTimeSelect}
                  activeOpacity={0.7}
                >
                  <SymbolView
                    name="clock"
                    size={16}
                    tintColor={
                      selectedTime
                        ? theme.colors.text
                        : theme.colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.selectorText,
                      selectedTime && styles.selectorTextActive,
                    ]}
                  >
                    {selectedTime ? formatTime(selectedTime) : "Add time"}
                  </Text>
                </AnimatedTouchable>

                <AnimatedTouchable
                  cornerSmoothing={80}
                  borderRadius={12}
                  preserveSmoothing
                  entering={FadeIn.duration(400).delay(300)}
                  style={[
                    styles.selectorButton,
                    selectedIcon && styles.selectorButtonActive,
                  ]}
                  onPress={handleIconSelect}
                  activeOpacity={0.7}
                >
                  {selectedIcon ? (
                    <Lucide
                      name={selectedIcon as any}
                      size={16}
                      color={theme.colors.text}
                    />
                  ) : (
                    <SymbolView
                      name="sparkles"
                      size={16}
                      tintColor={theme.colors.textSecondary}
                    />
                  )}
                  <Text
                    style={[
                      styles.selectorText,
                      selectedIcon && styles.selectorTextActive,
                    ]}
                  >
                    {selectedIcon ? "Icon" : "Add icon"}
                  </Text>
                </AnimatedTouchable>
              </View>
            ) : (
              <View style={styles.selectorsRow}>
                <AnimatedTouchable
                  cornerSmoothing={80}
                  borderRadius={12}
                  preserveSmoothing
                  entering={FadeIn.duration(400).delay(100)}
                  style={[
                    styles.selectorButton,
                    selectedTime && styles.selectorButtonActive,
                  ]}
                  onPress={handleTimeSelect}
                  activeOpacity={0.7}
                >
                  <SymbolView
                    name="clock"
                    size={16}
                    tintColor={
                      selectedTime
                        ? theme.colors.text
                        : theme.colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.selectorText,
                      selectedTime && styles.selectorTextActive,
                    ]}
                  >
                    {selectedTime ? formatTime(selectedTime) : "Add time"}
                  </Text>
                </AnimatedTouchable>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <AnimatedTouchable
                      cornerSmoothing={80}
                      borderRadius={12}
                      preserveSmoothing
                      entering={FadeIn.duration(400).delay(200)}
                      style={[
                        styles.selectorButton,
                        styles.selectorButtonActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <SymbolView
                        name="repeat"
                        size={16}
                        tintColor={theme.colors.text}
                      />
                      <Text
                        style={[styles.selectorText, styles.selectorTextActive]}
                      >
                        {habitLabel}
                      </Text>
                    </AnimatedTouchable>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    loop={false}
                    alignOffset={0}
                    avoidCollisions
                    collisionPadding={8}
                  >
                    <DropdownMenu.CheckboxItem
                      key="habit-daily"
                      value={habitRepeatInterval === "daily" ? "on" : "off"}
                      onValueChange={handleHabitRepeatDaily}
                    >
                      <DropdownMenu.ItemIndicator />
                      <DropdownMenu.ItemTitle>Every day</DropdownMenu.ItemTitle>
                    </DropdownMenu.CheckboxItem>
                    <DropdownMenu.Separator />
                    {WEEKDAY_LABELS.map((weekday, index) => (
                      <DropdownMenu.CheckboxItem
                        key={`habit-weekday-${weekday}`}
                        value={
                          habitRepeatInterval === "weekly" &&
                            habitRepeatWeekday === index
                            ? "on"
                            : "off"
                        }
                        onValueChange={() => handleHabitRepeatWeekly(index)}
                      >
                        <DropdownMenu.ItemIndicator />
                        <DropdownMenu.ItemTitle>
                          {`Every ${weekday}`}
                        </DropdownMenu.ItemTitle>
                      </DropdownMenu.CheckboxItem>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </View>
            )}

            <Animated.View style={addButtonAnimatedStyle}>
              <GlassView
                style={styles.addButton}
                isInteractive
                glassEffectStyle="clear"
                onTouchStart={handleAdd}
              >
                <Text style={styles.addButtonText}>{addButtonLabel}</Text>
              </GlassView>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Date Picker Sheet */}
      <TrueSheet
        ref={dateSheetRef}
        dimmed
        detents={[0.4]}
        cornerRadius={50}
        grabber
        backgroundBlur="default"
        blurOptions={{
          intensity: 50,
          interaction: true,
        }}
        style={[styles.sheetContainer, {}]}
      >
        <Host style={{ height: height * 0.4 - 20 }}>
          <DateTimePicker
            initialDate={selectedDate?.toISOString()}
            displayedComponents="date"
            variant="graphical"
            onDateSelected={handleDateChange}
          />
        </Host>
      </TrueSheet>

      {/* Time Picker Sheet */}
      <TrueSheet
        ref={timeSheetRef}
        dimmed
        detents={[0.2]}
        cornerRadius={50}
        grabber
        backgroundBlur="default"
        blurOptions={{
          intensity: 50,
          interaction: true,
        }}
        style={[styles.sheetContainer, {}]}
      >
        <Host style={{ height: height * 0.2 - 20 }}>
          <DateTimePicker
            initialDate={selectedTime?.toISOString()}
            displayedComponents="hourAndMinute"
            variant="wheel"
            onDateSelected={handleTimeChange}
          />
        </Host>
      </TrueSheet>

      {/* Icon Picker Sheet */}
      <IconPickerSheet
        sheetRef={iconSheetRef as any}
        onIconSelect={handleIconChange}
        selectedIcon={selectedIcon || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
  },
  layout: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: rt.insets.top,
    paddingBottom: rt.insets.bottom,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingBottom: "20%",
  },
  titleInput: {
    fontSize: 28,
    fontFamily: theme.fonts.primary,
    color: theme.colors.text,
    paddingVertical: 0,
  },
  aiSuggestionCard: {
    // backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 18,
    // borderWidth: 1,
    // borderColor: theme.colors.border,
    padding: 5,
    marginBottom: 12,
    zIndex: 2,
  },
  aiSuggestionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 8,
  },
  aiSuggestionHeaderText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.primary,
  },
  aiSuggestionBody: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  aiSuggestionText: {
    flex: 1,
    gap: 4,
  },
  aiSuggestionTitle: {
    fontSize: 20,
    color: theme.colors.text,
    fontFamily: theme.fonts.primary,
  },
  aiSuggestionShimmer: {
    paddingVertical: 6,
  },
  aiSuggestionMeta: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.primary,
  },
  aiSuggestionActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  aiApplyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.backgroundQuaternary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  aiApplyButtonDisabled: {
    opacity: 0.6,
  },
  aiApplyButtonText: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.primary,
  },
  aiDismissButton: {
    width: 32,
    height: 32,
    backgroundColor: theme.colors.backgroundQuaternary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  typeSelectorsRow: {
    flexDirection: "row" as const,
    gap: 8,
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: {
    flex: 1,
  },
  selectorsRow: {
    flexDirection: "row" as const,
    gap: 8,
  },
  selectorButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  selectorButtonActive: {
    borderColor: theme.colors.text,
    // backgroundColor: theme.colors.backgroundTertiary,
  },
  selectorText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.primary,
  },
  selectorTextActive: {
    color: theme.colors.text,
  },
  addButton: {
    width: "100%",
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.buttonPrimary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    alignSelf: "center" as const,
    paddingVertical: 25,
    marginTop: 22,
  },
  addButtonText: {
    fontFamily: theme.fonts.primary,
    fontSize: 22,
    color: theme.colors.buttonPrimaryText,
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
  sheetButtons: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.backgroundQuaternary,
    alignItems: "center" as const,
  },
  clearButtonText: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  doneButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.buttonPrimary,
    alignItems: "center" as const,
  },
  doneButtonText: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    color: theme.colors.buttonPrimaryText,
  },
}));
