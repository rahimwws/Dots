import React, { useMemo, useState, useEffect } from "react";
import { Text, TextStyle, Platform, View } from "react-native";
import {
  StyleSheet,
  useUnistyles,
  withUnistyles,
} from "react-native-unistyles";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import * as ContextMenu from "zeego/context-menu";

interface SelectableTextProps {
  text: string;
  style?: TextStyle;
  onRegenerate?: () => void;
}

const UniText = withUnistyles(Animated.Text);

const motivationalQuotes = [
  "The magic you've been looking for is in the work you're avoiding.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Your only limit is the amount of action you take today.",
  "Dream big, start small, but most of all, start.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
  "Believe you can and you're halfway there.",
  "Small steps every day lead to big changes over time.",
  "You are stronger than you think, braver than you believe.",
];
export const SelectableText: React.FC<SelectableTextProps> = ({
  text: initialText,
  style,
  onRegenerate,
}) => {
  const { theme } = useUnistyles();
  const [text, setText] = useState(initialText);
  const [animationKey, setAnimationKey] = useState(0);

  const words = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return [];
    return trimmed.split(/\s+/);
  }, [text]);

  const AnimatedWord = ({
    word,
    index,
    isLast,
    textStyle,
    extraTextStyle,
  }: {
    word: string;
    index: number;
    isLast: boolean;
    textStyle?: TextStyle;
    extraTextStyle?: TextStyle;
  }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(10);

    useEffect(() => {
      const delayMs = index * 80; // 80ms per word

      opacity.value = withDelay(
        delayMs,
        withTiming(1, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        })
      );

      translateY.value = withDelay(
        delayMs,
        withTiming(0, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        })
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animationKey, index]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }));

    return (
      <UniText style={[textStyle, extraTextStyle, animatedStyle]}>
        {word}
        {!isLast ? " " : ""}
      </UniText>
    );
  };

  const WordReveal = ({
    textStyle,
    extraTextStyle,
  }: {
    textStyle?: TextStyle;
    extraTextStyle?: TextStyle;
  }) => {
    return (
      <Text style={[textStyle, extraTextStyle]}>
        {words.map((word, i) => (
          <AnimatedWord
            key={`${animationKey}-${i}`}
            word={word}
            index={i}
            isLast={i === words.length - 1}
            textStyle={textStyle}
            extraTextStyle={extraTextStyle}
          />
        ))}
      </Text>
    );
  };

  const startWordReveal = (nextText: string) => {
    setText(nextText);
    setAnimationKey((prev) => prev + 1);
  };

  const handleRegenerate = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Генерируем новый текст
    const currentIndex = motivationalQuotes.indexOf(text);
    let newIndex;

    do {
      newIndex = Math.floor(Math.random() * motivationalQuotes.length);
    } while (newIndex === currentIndex && motivationalQuotes.length > 1);

    const newText = motivationalQuotes[newIndex];
    startWordReveal(newText);

    if (onRegenerate) {
      onRegenerate();
    }
  };

  const handleCopy = async () => {
    if (Platform.OS === "ios") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await Clipboard.setStringAsync(text);
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <View style={styles.container}>
          <WordReveal textStyle={style} />
        </View>
      </ContextMenu.Trigger>

      <ContextMenu.Content
        loop={false}
        alignOffset={0}
        avoidCollisions
        collisionPadding={8}
      >
        <ContextMenu.Preview>
          {() => (
            <View
              style={[
                styles.previewContainer,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <WordReveal
                textStyle={style}
                extraTextStyle={[
                  styles.previewText,
                  { color: theme.colors.text },
                ]}
              />
            </View>
          )}
        </ContextMenu.Preview>

        <ContextMenu.Item key="regenerate" onSelect={handleRegenerate}>
          <ContextMenu.ItemIcon
            ios={{
              name: "arrow.clockwise",
              pointSize: 18,
            }}
            androidIconName="ic_menu_rotate"
          />
          <ContextMenu.ItemTitle>Regenerate</ContextMenu.ItemTitle>
        </ContextMenu.Item>

        <ContextMenu.Item key="copy" onSelect={handleCopy}>
          <ContextMenu.ItemIcon
            ios={{
              name: "doc.on.doc",
              pointSize: 18,
            }}
            androidIconName="ic_menu_copy"
          />
          <ContextMenu.ItemTitle>Copy</ContextMenu.ItemTitle>
        </ContextMenu.Item>

        <ContextMenu.Separator />

        <ContextMenu.Item
          key="share"
          onSelect={async () => {
            if (Platform.OS === "ios") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            // Здесь можно добавить Share функционал
            console.log("Share:", text);
          }}
        >
          <ContextMenu.ItemIcon
            ios={{
              name: "square.and.arrow.up",
              pointSize: 18,
            }}
            androidIconName="ic_menu_share"
          />
          <ContextMenu.ItemTitle>Share</ContextMenu.ItemTitle>
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    // Пустой контейнер для trigger
  },
  previewContainer: {
    paddingHorizontal: 20,
    // paddingVertical: 16,
    borderRadius: 16,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  previewText: {
    // Color will be set inline dynamically
  },
}));
