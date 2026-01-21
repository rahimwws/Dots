import React from "react";
import { Animated, Text } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface TextSegment {
  text: string;
  bold: boolean;
}

interface ShimmerTextProps {
  text?: TextSegment[];
}

const DEFAULT_TEXT: TextSegment[] = [
  { text: "swipe ", bold: false },
  { text: "me", bold: true },
  { text: " down", bold: false },
];

/**
 * @description Animated text with character-by-character shimmer effect
 * @param text - Array of text segments with bold flags
 * @example
 * <ShimmerText text={[{ text: "Hello ", bold: false }, { text: "World", bold: true }]} />
 */
export const ShimmerText = ({ text = DEFAULT_TEXT }: ShimmerTextProps) => {
  const { theme } = useUnistyles();

  const letters: { char: string; bold: boolean }[] = [];
  text.forEach((segment) => {
    segment.text.split("").forEach((char) => letters.push({ char, bold: segment.bold }));
  });

  const values = letters.map(() => new Animated.Value(0));

  React.useEffect(() => {
    const animate = () => {
      const anims = values.map((value, idx) =>
        Animated.sequence([
          Animated.delay(idx * 60),
          Animated.timing(value, { toValue: 1, duration: 220, useNativeDriver: false }),
          Animated.timing(value, { toValue: 0, duration: 220, useNativeDriver: false }),
        ])
      );

      Animated.sequence([Animated.stagger(60, anims), Animated.delay(600)]).start(() => {
        values.forEach((value) => value.setValue(0));
        animate();
      });
    };

    animate();

    return () => {
      values.forEach((value) => value.stopAnimation());
    };
  }, [values]);

  return (
    <Text style={styles.container}>
      {letters.map((item, idx) => {
        const color = values[idx].interpolate({
          inputRange: [0, 1],
          outputRange: [theme.colors.textHint, theme.colors.text],
        });

        return (
          <Animated.Text
            key={`${item.char}-${idx}`}
            style={[styles.letter, { color, fontWeight: item.bold ? "700" : "400" }]}
          >
            {item.char}
          </Animated.Text>
        );
      })}
    </Text>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    fontFamily: theme.fonts.primary,
    fontSize: 18,
    color: theme.colors.textHint,
    flexDirection: "row",
  },
  letter: {
    fontFamily: theme.fonts.primary,
    fontSize: 18,
  },
}));
