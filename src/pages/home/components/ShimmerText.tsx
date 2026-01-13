import React from "react";
import { Animated, Text } from "react-native";

type Segment = { text: string; bold: boolean };

export const ShimmerText = ({
  text = [
    { text: "swipe ", bold: false },
    { text: "me", bold: true },
    { text: " down", bold: false },
  ],
}: {
  text?: Segment[];
}) => {
  const letters: { char: string; bold: boolean }[] = [];
  text.forEach((segment) => {
    segment.text
      .split("")
      .forEach((char) => letters.push({ char, bold: segment.bold }));
  });

  const values = letters.map(() => new Animated.Value(0));

  React.useEffect(() => {
    const animate = () => {
      const anims = values.map((value, idx) =>
        Animated.sequence([
          Animated.delay(idx * 60),
          Animated.timing(value, {
            toValue: 1,
            duration: 220,
            useNativeDriver: false,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 220,
            useNativeDriver: false,
          }),
        ])
      );

      Animated.sequence([
        Animated.stagger(60, anims),
        Animated.delay(600),
      ]).start(() => {
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
    <Text
      style={{
        fontFamily: "is-r",
        fontSize: 18,
        color: "#9B9B9B",
        flexDirection: "row",
      }}
    >
      {letters.map((item, idx) => {
        const color = values[idx].interpolate({
          inputRange: [0, 1],
          outputRange: ["#9B9B9B", "#000000"],
        });

        return (
          <Animated.Text
            key={`${item.char}-${idx}`}
            style={{
              color,
              fontFamily: "is-r",
              fontSize: 18,
              fontWeight: item.bold ? "700" : "400",
            }}
          >
            {item.char}
          </Animated.Text>
        );
      })}
    </Text>
  );
};
