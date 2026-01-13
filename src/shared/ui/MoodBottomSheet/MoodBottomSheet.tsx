import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { SquircleButton } from "expo-squircle-view";
const AnimatedSquircleButton = Animated.createAnimatedComponent(SquircleButton);

interface MoodTrigger {
  id: string;
  label: string;
}

const MOOD_TRIGGERS: MoodTrigger[] = [
  { id: "Productive", label: "Productive" },
  { id: "Relaxed", label: "Relaxed" },
  { id: "Stressed", label: "Stressed" },
  { id: "Anxious", label: "Anxious" },
];

interface MoodBottomSheetProps {
  visible: boolean;
  onClose: (isOpened: boolean) => void;
  onContinue: (selectedTriggers: string[]) => void;
}

export const MoodBottomSheet: React.FC<MoodBottomSheetProps> = ({
  visible,
  onClose,
  onContinue,
}) => {
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(["walk"]);
  const height = useWindowDimensions().height;
  const sheet = useRef<TrueSheet>(null);

  useEffect(() => {
    if (visible) {
      // Небольшая задержка для правильной анимации
      setTimeout(() => {
        sheet.current?.present();
      }, 100);
    }
  }, [visible]);

  const toggleTrigger = (id: string) => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTriggers((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onContinue(selectedTriggers);
  };

  return (
    <TrueSheet
      ref={sheet}
      dimmed
      detents={[0.5]}
      cornerRadius={50}
      grabber
      backgroundBlur="default"
      blurOptions={{
        intensity: 50,
        interaction: true,
      }}
      onDidDismiss={() => onClose(false)}
      style={{ height: height * 0.6, paddingHorizontal: 20, paddingTop: 25 }}
    >
      <Text style={styles.title}>What your mood for today?</Text>

      <View style={{ marginTop: 8, width: "100%" }}>
        {MOOD_TRIGGERS.map((trigger) => {
          const isSelected = selectedTriggers.includes(trigger.id);
          return (
            <OptionRow
              key={trigger.id}
              label={trigger.label}
              isSelected={isSelected}
              onPress={() => toggleTrigger(trigger.id)}
            />
          );
        })}
      </View>

      <View style={styles.continueButton} onTouchStart={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </View>
    </TrueSheet>
  );
};

const OptionRow = ({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const borderColor = useSharedValue(isSelected ? "#1F1F1F" : "#E6E6E6");

  useEffect(() => {
    borderColor.value = withTiming(isSelected ? "#1F1F1F" : "#E6E6E6", {
      duration: 2400,
    });
  }, [isSelected, borderColor]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  return (
    <AnimatedSquircleButton
      activeOpacity={0.7}
      cornerSmoothing={80}
      borderRadius={15}
      preserveSmoothing
      borderWidth={1}
      onPress={onPress}
      style={[
        animatedStyle,
        styles.optionContainer,
        isSelected && styles.optionContainerSelected,
      ]}
    >
      <Text
        style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}
      >
        {label}
      </Text>
    </AnimatedSquircleButton>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: "is-r",
    fontSize: 28,
    color: "#1A1A1A",
    marginBottom: 18,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    marginBottom: 12,
  },
  optionContainerSelected: {
    borderColor: "#1F1F1F",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D5D5D5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: "#000",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000",
  },
  optionLabel: {
    fontFamily: "is-r",
    fontSize: 16,
    color: "#7A7A7A",
  },
  optionLabelSelected: {
    color: "#000",
  },
  continueButton: {
    width: "100%",
    borderRadius: 100,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    marginTop: 20,
  },
  continueButtonText: {
    fontFamily: "is-r",
    fontSize: 20,
    color: "#fff",
  },
});
