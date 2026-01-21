import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface MoodDotProps {
  color: string;
  size?: number;
}

export const MoodDot = ({ color, size = 10 }: MoodDotProps) => {
  return <View style={[styles.dot, { backgroundColor: color, width: size, height: size }]} />;
};

const styles = StyleSheet.create({
  dot: {
    borderRadius: 999,
  },
});
