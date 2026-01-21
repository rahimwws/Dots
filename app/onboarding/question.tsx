import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useCallback, useRef } from "react";
import { GlassView } from "expo-glass-effect";
import { SquircleButton } from "expo-squircle-view";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { router } from "expo-router";
import { trackEvent, AnalyticsEvents } from "@/shared/lib/analytics";

const QUESTIONS = [
  {
    id: 1,
    question: "What do you do most days?",
    options: ["Deep work", "Meetings", "Creative", "Study"],
  },
  {
    id: 2,
    question: "When do you usually feel sharper?",
    options: ["Morning", "Afternoon", "Night", "It changes"],
  },
  {
    id: 3,
    question: "What affects you most?",
    options: ["Sleep", "Stress", "Schedule", "Health", "Unclear"],
  },
];

export default function OnboardingQuestionScreen() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const answersRef = useRef<string[]>([]);

  const currentQuestion = QUESTIONS[currentStep];
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const nextEnabled = Boolean(selected);

  const handleNext = useCallback(async () => {
    if (!nextEnabled || !selected) return;

    // Store the answer
    answersRef.current[currentStep] = selected;

    if (isLastStep) {
      // Track questions completed with all answers
      trackEvent(AnalyticsEvents.QUESTIONS_COMPLETED, {
        answers: answersRef.current,
      });
      router.push("/onboarding/tasks");
      return;
    }

    setCurrentStep((prev) => prev + 1);
    setSelected(null);
  }, [nextEnabled, isLastStep, selected, currentStep]);

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

      <Animated.View
        key={currentStep}
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(200)}
        style={styles.content}
      >
        <View style={styles.questionBlock}>
          <Text style={[styles.question, { color: theme.colors.text }]}>
            {currentQuestion.question}
          </Text>
        </View>

        <View style={styles.options}>
          {currentQuestion.options.map((option) => {
            const isSelected = option === selected;
            return (
              <SquircleButton
                key={option}
                cornerSmoothing={100}
                borderRadius={16}
                preserveSmoothing
                onPress={() => setSelected(option)}
                style={[
                  styles.option,
                  {
                    borderColor: isSelected
                      ? theme.colors.text
                      : theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: theme.colors.text }]}>
                  {option}
                </Text>
              </SquircleButton>
            );
          })}
        </View>
      </Animated.View>

      <GlassView
        isInteractive
        glassEffectStyle="clear"
        onTouchEnd={handleNext}
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
          {isLastStep ? "Get Started" : "Next"}
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
  content: {
    flex: 1,
  },
  questionBlock: {
    marginBottom: 24,
    // alignItems: "center",
    justifyContent: "flex-start",
  },
  question: {
    fontFamily: theme.fonts.primary,
    fontSize: 28,
  },
  options: {
    gap: 12,
  },
  option: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  optionText: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
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
