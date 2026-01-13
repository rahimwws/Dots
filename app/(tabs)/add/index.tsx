import { Layout } from "@/shared/ui/Layout";
import { useTasks } from "@/shared/lib/tasks";
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { DateTimePicker, Host } from "@expo/ui/swift-ui";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { GlassView } from "expo-glass-effect";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { Audio } from "expo-av";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AddTaskScreen() {
  const { height } = useWindowDimensions();
  const router = useRouter();
  const { createTask } = useTasks();
  const [taskTitle, setTaskTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const dateSheetRef = useRef<TrueSheet>(null);
  const timeSheetRef = useRef<TrueSheet>(null);
  const lastTypeTime = useRef<number>(0);

  // Animated values
  const inputScale = useSharedValue(0.95);
  const addButtonOpacity = useSharedValue(0.5);

  // Configure audio on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  }, []);

  useEffect(() => {
    addButtonOpacity.value = withTiming(taskTitle.trim() ? 1 : 0.5, {
      duration: 300,
    });
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

    const taskDate = selectedDate || new Date();
    const dateString = taskDate.toISOString().split("T")[0];

    await createTask({
      title: taskTitle.trim(),
      date: dateString,
    });

    setTaskTitle("");
    setSelectedDate(null);
    setSelectedTime(null);
    router.back();
  };

  const playTypewriterSound = async () => {
    const now = Date.now();
    const MIN_INTERVAL = 10; // Throttle to avoid too many sounds

    if (now - lastTypeTime.current < MIN_INTERVAL) {
      return;
    }

    lastTypeTime.current = now;

    // Combination of haptic and sound for authentic typewriter feel
    if (Platform.OS === "ios") {
      // Use Rigid haptic for mechanical typewriter feel
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    }

    // Play typewriter click sound
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../../assets/sounds/typewriter-click.wav"),
        {
          shouldPlay: true,
          volume: 0.5,
          rate: 1.0,
        }
      );

      // Auto cleanup after sound finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      // Log for debugging
      console.log("Audio error:", error);
    }
  };

  const playReturnSound = async () => {
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
      const { sound } = await Audio.Sound.createAsync(
        require("../../../assets/sounds/return.wav"),
        {
          shouldPlay: true,
          volume: 0.5,
          rate: 1.0,
        }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
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
  };

  const handleInputFocus = () => {
    inputScale.value = withSpring(1, {});
  };

  const handleInputBlur = () => {
    inputScale.value = withSpring(0.95);
  };

  const handleSubmitEditing = () => {
    // Play return sound when user presses Done/Return
    playReturnSound();
  };

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const addButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: addButtonOpacity.value,
  }));

  return (
    <Layout includeTopInset scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={-25}
      >
        <View style={styles.content}>
          <Animated.View style={inputAnimatedStyle}>
            <TextInput
              style={styles.titleInput}
              placeholder="Task title"
              placeholderTextColor="#A0A0A0"
              value={taskTitle}
              onChangeText={handleTextChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onSubmitEditing={handleSubmitEditing}
              multiline
              returnKeyType="done"
              selectionColor="#000"
              selectionHandleColor="#000"
            />
          </Animated.View>

          <View style={styles.spacer} />

          <View style={styles.selectorsRow}>
            <AnimatedTouchable
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
                tintColor={selectedDate ? "#1F1F1F" : "#7A7A7A"}
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
                tintColor={selectedTime ? "#1F1F1F" : "#7A7A7A"}
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
          </View>

          <Animated.View style={addButtonAnimatedStyle}>
            <GlassView
              style={styles.addButton}
              isInteractive
              glassEffectStyle="clear"
              onTouchStart={handleAdd}
            >
              <Text style={styles.addButtonText}>Add task</Text>
            </GlassView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

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
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: "30%",
  },
  titleInput: {
    fontSize: 28,
    fontFamily: "is-r",
    color: "#1F1F1F",
    paddingVertical: 0,
  },
  spacer: {
    flex: 1,
  },
  selectorsRow: {
    flexDirection: "row",
    gap: 8,
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    backgroundColor: "#FFFFFF",
  },
  selectorButtonActive: {
    borderColor: "#1F1F1F",
    backgroundColor: "#FAFAFA",
  },
  selectorText: {
    fontSize: 15,
    color: "#7A7A7A",
    fontFamily: "is-r",
  },
  selectorTextActive: {
    color: "#1F1F1F",
  },
  addButton: {
    width: "100%",
    borderRadius: 100,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 25,
    marginTop: 22,
  },
  addButtonText: {
    fontFamily: "is-r",
    fontSize: 22,
    color: "#fff",
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
  sheetButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 100,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  clearButtonText: {
    fontFamily: "is-r",
    fontSize: 16,
    color: "#7A7A7A",
  },
  doneButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 100,
    backgroundColor: "#000",
    alignItems: "center",
  },
  doneButtonText: {
    fontFamily: "is-r",
    fontSize: 16,
    color: "#fff",
  },
});
