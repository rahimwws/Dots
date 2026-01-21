import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo } from "react";
import { GlassView } from "expo-glass-effect";
import { SquircleButton } from "expo-squircle-view";
import { router } from "expo-router";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { MoodBottomSheet } from "@/features/select-mood";
import { useMood } from "@/entities/mood";
import { trackEvent, AnalyticsEvents } from "@/shared/lib/analytics";

export default function OnboardingMoodScreen() {
  const moodSheetRef = useRef<TrueSheet>(null);
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const { todayMood } = useMood();
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const handleOpenSheet = useCallback(() => {
    moodSheetRef.current?.present();
  }, []);

  const handleContinue = useCallback((_selected: string[]) => {
    // router.push("/onboarding/signature");
    console.log("f");

  }, []);

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
          How do you feel today?
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Tap to capture your mood for today.
        </Text>
      </View>

      <SquircleButton
        cornerSmoothing={100}
        borderRadius={20}
        preserveSmoothing
        onPress={handleOpenSheet}
        style={[
          styles.moodCard,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.backgroundSecondary,
          },
        ]}
      >
        <Text style={[styles.moodLabel, { color: theme.colors.textSecondary }]}>
          Today I feel
        </Text>
        <Text style={[styles.moodValue, { color: theme.colors.text }]}>
          {todayMood?.mood ? todayMood.mood : "Tap to choose"}
        </Text>
      </SquircleButton>

      <GlassView
        isInteractive
        glassEffectStyle="clear"
        onTouchEnd={!todayMood?.mood ? handleOpenSheet : () => {
          // Track mood selected event
          trackEvent(AnalyticsEvents.MOOD_SELECTED, { mood: todayMood.mood });
          router.push("/onboarding/signature");
        }}
        style={[
          styles.nextButton,
          {
            backgroundColor: theme.colors.buttonPrimary,
          },
        ]}
      >
        <Text
          style={[
            styles.nextButtonText,
            { color: theme.colors.buttonPrimaryText },
          ]}
        >
          {!todayMood?.mood ? "Choose mood" : "Continue"}
        </Text>
      </GlassView>

      <MoodBottomSheet
        sheetRef={moodSheetRef}
        onClose={() => {}}
        onContinue={handleContinue}
        date={todayKey}
        name="mood"
      />
    </View >
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
  moodCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  moodLabel: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
  },
  moodValue: {
    fontFamily: theme.fonts.primary,
    fontSize: 22,
    marginTop: 8,
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
