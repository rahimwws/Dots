import {
  Text,
  View,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  Pressable,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type MutableRefObject,
} from "react";
import { GlassView } from "expo-glass-effect";
import { useRouter } from "expo-router";
import { useAudioPlayer, AudioModule } from "expo-audio";
import * as Haptics from "expo-haptics";
import Animated, {
  Extrapolate,
  interpolate,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SquircleView } from "expo-squircle-view";
import { saveUserName } from "@/entities/user";
import { trackEvent, AnalyticsEvents } from "@/shared/lib/analytics";

const TICKET_HEIGHT = 280;
const TICKET_CUT = 150;
const TICKET_DROP_DISTANCE = 520;
const TEAR_SNAP_THRESHOLD = 0.65;
const NOTCH_SIZE = 26;
const NOTCH_RADIUS = NOTCH_SIZE / 2;
const OVERLAY_COLOR = "white";
const QR_GRID = [
  [1, 1, 1, 0, 1, 1, 0],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1],
  [0, 0, 0, 1, 0, 0, 0],
  [1, 1, 0, 1, 1, 1, 0],
  [1, 0, 1, 0, 0, 1, 1],
  [1, 1, 0, 1, 1, 0, 1],
];

export default function OnboardingNameScreen() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState("");
  const lastTypeTime = useRef<number>(0);
  const typewriterIndex = useRef(0);
  const returnIndex = useRef(0);
  const [ticketVisible, setTicketVisible] = useState(false);

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
  const nextButtonOpacity = useSharedValue(0.5);
  const ticketProgress = useSharedValue(0);
  const tearProgress = useSharedValue(0);
  const tearStart = useSharedValue(0);
  const bottomFall = useSharedValue(0);
  const ticketWidth = useSharedValue(1);
  const tearDirection = useSharedValue(1);

  // Configure audio on mount
  useEffect(() => {
    AudioModule.setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
  }, []);

  useEffect(() => {
    nextButtonOpacity.value = withTiming(name.trim() ? 1 : 0.5, {
      duration: 300,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const nextEnabled = name.trim().length > 0;

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
    if (text.length > name.length) {
      // Adding characters - play typewriter sound
      playTypewriterSound();
    } else if (text.length < name.length) {
      // Deleting characters - play return sound
      playReturnSound();
    }
    setName(text);
    if (!text.trim() && ticketVisible) {
      setTicketVisible(false);
      tearProgress.value = withTiming(0, { duration: 200 });
      bottomFall.value = 0;
      tearDirection.value = 1;
      ticketProgress.value = withTiming(0, { duration: 200 });
    }
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
    // Play return sound when user presses Done/Return
    playReturnSound();
    handleNext();
  };

  const handleNext = useCallback(() => {
    if (!nextEnabled) return;
    setTicketVisible(true);
    tearProgress.value = 0;
    tearStart.value = 0;
    bottomFall.value = 0;
    tearDirection.value = 1;
    ticketProgress.value = withSpring(1);
    Keyboard.dismiss();
  }, [
    nextEnabled,
    tearProgress,
    tearStart,
    bottomFall,
    tearDirection,
    ticketProgress,
  ]);

  const handleTicketDrop = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    await saveUserName(name.trim());

    // Track name entered event
    trackEvent(AnalyticsEvents.NAME_ENTERED, { name_length: name.trim().length });

    setTicketVisible(false);
    router.push("/onboarding/question");
  }, [router, name]);

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const nextButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: nextButtonOpacity.value,
  }));

  const ticketAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      ticketProgress.value,
      [0, 1],
      [40, 0],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      ticketProgress.value,
      [0, 1],
      [0.92, 1],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      ticketProgress.value,
      [0, 0.4, 1],
      [0, 0.6, 1],
      Extrapolate.CLAMP
    );
    const rotate = interpolate(
      ticketProgress.value,
      [0, 1],
      [-2, 0],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }, { scale }, { rotate: `${rotate}deg` }],
    };
  });

  const ticketBottomAnimatedStyle = useAnimatedStyle(() => {
    const baseDrop = interpolate(
      tearProgress.value,
      [0, 1],
      [0, TICKET_CUT * 0.6],
      Extrapolate.CLAMP
    );
    const translateX =
      interpolate(tearProgress.value, [0, 1], [0, 16], Extrapolate.CLAMP) *
      tearDirection.value;
    const rotate =
      interpolate(tearProgress.value, [0, 1], [0, 8], Extrapolate.CLAMP) *
      tearDirection.value;
    return {
      transform: [
        { translateY: baseDrop + bottomFall.value },
        { translateX },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const ticketPan = Gesture.Pan()
    .enabled(ticketVisible)
    .activeOffsetX([-10, 10])
    .onBegin((event) => {
      tearStart.value = tearProgress.value;
      bottomFall.value = 0;
      const width = ticketWidth.value || 1;
      tearDirection.value = event.x < width / 2 ? -1 : 1;
    })
    .onUpdate((event) => {
      const width = ticketWidth.value || 1;
      const next = tearStart.value + Math.abs(event.translationX) / width;
      tearProgress.value = Math.min(1, Math.max(0, next));
    })
    .onEnd(() => {
      if (tearProgress.value >= TEAR_SNAP_THRESHOLD) {
        tearProgress.value = withTiming(1, { duration: 200 });
        bottomFall.value = withTiming(
          TICKET_DROP_DISTANCE,
          { duration: 360 },
          (finished) => {
            if (finished) {
              runOnJS(handleTicketDrop)();
            }
          }
        );
        return;
      }
      tearProgress.value = withTiming(0, { duration: 200 });
      bottomFall.value = withTiming(0, { duration: 200 });
    });

  const ticketName = name.trim() || "Friend";

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

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={10}
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              What&apos;s your name?
            </Text>

            <Animated.View style={inputAnimatedStyle}>
              <TextInput
                style={[styles.nameInput, { color: theme.colors.text }]}
                placeholder="Your name"
                placeholderTextColor={theme.colors.textTertiary}
                value={name}
                onChangeText={handleTextChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onSubmitEditing={handleSubmitEditing}
                autoFocus
                returnKeyType="done"
                selectionColor={theme.colors.text}
                selectionHandleColor={theme.colors.text}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </Animated.View>
          </View>

          <Animated.View style={nextButtonAnimatedStyle}>
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
                Continue
              </Text>
            </GlassView>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Modal
        visible={ticketVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setTicketVisible(false);
          tearProgress.value = withTiming(0, { duration: 200 });
          bottomFall.value = 0;
          tearDirection.value = 1;
          ticketProgress.value = withTiming(0, { duration: 200 });
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setTicketVisible(false);
            tearProgress.value = withTiming(0, { duration: 200 });
            bottomFall.value = 0;
            tearDirection.value = 1;
            ticketProgress.value = withTiming(0, { duration: 200 });
          }}
        >
          <Text style={styles.modalTitle}>Cut the your pass</Text>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <GestureDetector gesture={ticketPan}>
              <Animated.View
                style={[styles.ticketWrap, ticketAnimatedStyle]}
                onLayout={(event) => {
                  ticketWidth.value = event.nativeEvent.layout.width;
                }}
              >
                <SquircleView
                  borderRadius={52}
                  cornerSmoothing={80}
                  preserveSmoothing
                  style={styles.ticketContainer}
                >
                  <View style={styles.ticketSeparator} />
                  <View style={styles.ticketTopWrap}>
                    <View style={styles.ticketTopNotchLeft} />
                    <View style={styles.ticketTopNotchRight} />
                    <View style={styles.ticketTop}>
                      <View style={styles.ticketHeader}>
                        <Text style={styles.ticketLabel}>ENTRY PASS</Text>
                        <View style={styles.ticketCode}>
                          <Text style={styles.ticketCodeText}>C12O987</Text>
                        </View>
                      </View>
                      <Text style={styles.ticketTitle}>
                        {ticketName}, are you ready to change your life in 30
                        seconds a day?
                      </Text>
                    </View>
                  </View>
                  <Animated.View
                    style={[styles.ticketBottomWrap, ticketBottomAnimatedStyle]}
                  >
                    <View style={styles.ticketBottomNotchLeft} />
                    <View style={styles.ticketBottomNotchRight} />
                    <View style={styles.ticketBottom}>
                      <View style={styles.ticketFooter}>
                        <View style={styles.ticketQr}>
                          {QR_GRID.map((row, rowIndex) => (
                            <View
                              key={`row-${rowIndex}`}
                              style={styles.ticketQrRow}
                            >
                              {row.map((cell, cellIndex) => (
                                <View
                                  key={`cell-${rowIndex}-${cellIndex}`}
                                  style={[
                                    styles.ticketQrCell,
                                    cell === 1 && styles.ticketQrCellActive,
                                  ]}
                                />
                              ))}
                            </View>
                          ))}
                        </View>
                        <View style={styles.ticketFooterText}>
                          <Text style={styles.ticketFooterTitle}>
                            Your ticket
                          </Text>
                          <Text style={styles.ticketFooterSubtitle}>
                            Sign below and keep it close.
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                </SquircleView>
              </Animated.View>
            </GestureDetector>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 24,
  },
  title: {
    fontFamily: theme.fonts.primary,
    color: theme.colors.textInverse,
    fontSize: 28,
    textAlign: "center",
  },
  nameInput: {
    fontSize: 32,
    fontFamily: theme.fonts.primary,
    color: theme.colors.textInverse,
    textAlign: "center",
    paddingVertical: 16,
  },
  nextButton: {
    borderRadius: 999,
    paddingVertical: 25,
    alignItems: "center",
    zIndex: 99,
  },
  nextButtonText: {
    fontFamily: theme.fonts.primary,
    color: theme.colors.textInverse,
    fontSize: 22,
  },
  ticketWrap: {
    marginTop: 16,
    width: "100%",
  },
  ticketContainer: {
    height: TICKET_HEIGHT,
    position: "relative",
  },
  ticketTopWrap: {
    height: TICKET_CUT,
    width: "100%",
    overflow: "visible",
  },
  ticketTop: {
    height: "100%",
    backgroundColor: theme.colors.text,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    overflow: "hidden",
  },
  ticketBottomWrap: {
    height: TICKET_HEIGHT - TICKET_CUT,
    width: "100%",
    overflow: "visible",
  },
  ticketBottom: {
    height: "100%",
    backgroundColor: theme.colors.text,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    padding: 20,
    overflow: "hidden",
  },
  ticketTopNotchLeft: {
    position: "absolute",
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    borderRadius: NOTCH_RADIUS,
    backgroundColor: theme.colors.background,
    left: -NOTCH_RADIUS,
    bottom: -NOTCH_RADIUS,
    zIndex: 3,
  },
  ticketTopNotchRight: {
    position: "absolute",
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    borderRadius: NOTCH_RADIUS,
    backgroundColor: theme.colors.background,
    right: -NOTCH_RADIUS,
    bottom: -NOTCH_RADIUS,
    zIndex: 3,
  },
  ticketBottomNotchLeft: {
    position: "absolute",
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    borderRadius: NOTCH_RADIUS,
    backgroundColor: theme.colors.background,
    left: -NOTCH_RADIUS,
    top: -NOTCH_RADIUS,
    zIndex: 3,
  },
  ticketBottomNotchRight: {
    position: "absolute",
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    borderRadius: NOTCH_RADIUS,
    backgroundColor: theme.colors.background,
    right: -NOTCH_RADIUS,
    top: -NOTCH_RADIUS,
    zIndex: 3,
  },
  ticketSeparator: {
    position: "absolute",
    left: 12,
    right: 12,
    top: TICKET_CUT - 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255, 255, 255, 0.35)",
    zIndex: 2,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  ticketLabel: {
    fontFamily: theme.fonts.primary,
    color: theme.colors.textInverse,
    fontSize: 12,
    letterSpacing: 2,
  },
  ticketCode: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  ticketCodeText: {
    fontFamily: theme.fonts.primary,
    color: theme.colors.textInverse,
    fontSize: 12,
  },
  ticketTitle: {
    fontFamily: theme.fonts.primary,
    color: theme.colors.textInverse,
    fontSize: 20,
    marginTop: 12,
  },
  ticketFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  ticketQr: {
    backgroundColor: "#E8FFE4",
    borderRadius: 12,
    padding: 8,
    gap: 3,
  },
  ticketQrRow: {
    flexDirection: "row",
    gap: 3,
  },
  ticketQrCell: {
    width: 10,
    height: 10,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 2,
  },
  ticketQrCellActive: {
    backgroundColor: "#0F1D12",
  },
  ticketFooterText: {
    flex: 1,
  },
  ticketFooterTitle: {
    fontFamily: theme.fonts.primary,
    color: theme.colors.textInverse,
    fontSize: 16,
  },
  ticketFooterSubtitle: {
    fontFamily: theme.fonts.primary,
    color: theme.colors.textInverse,
    fontSize: 13,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 1,
  },
  modalButton: {
    borderRadius: 999,
    paddingVertical: 25,
    alignItems: "center",
    marginTop: 16,
  },
  modalTitle: {
    fontFamily: theme.fonts.primary,
    color: theme.colors.text,
    fontSize: 28,
    textAlign: "center",
    marginBottom: 16,
  },
}));
