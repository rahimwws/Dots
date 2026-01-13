import React from "react";
import { ScrollView, useWindowDimensions, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OverviewPage } from "./components/OverviewPage";
import { TasksPage } from "./components/TasksPage";

export const Home = () => {
  const { height, width } = useWindowDimensions();
  const pageHeight = height;
  const { bottom, top } = useSafeAreaInsets();
  const arrowOffset = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowOffset, {
          toValue: 4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(arrowOffset, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [arrowOffset]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      pagingEnabled
      snapToInterval={pageHeight}
      snapToOffsets={[pageHeight]}
      decelerationRate="fast"
      scrollEventThrottle={16}
      overScrollMode="never"
      onLayout={() => {}}
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
      contentInset={{ top: -top, bottom: 0, left: 0, right: 0 }}
      contentContainerStyle={{
        paddingTop: top,
        paddingBottom: bottom,
      }}
    >
      <OverviewPage arrowOffset={arrowOffset} />
      <TasksPage width={width} pageHeight={pageHeight} bottomInset={bottom} />
    </ScrollView>
  );
};
