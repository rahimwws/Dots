import React, { useMemo, useState, useRef } from "react";
import {
  ScrollView,
  useWindowDimensions,
  Animated,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OverviewPage } from "./components/OverviewPage";
import { TasksPage } from "./components/TasksPage";
import { MoodBottomSheet } from "@/features/select-mood";
import { MoodType, useMood } from "@/entities/mood";
import { useUnistyles } from "react-native-unistyles";
import { TasksListPage } from "./components/TasksListPage";

export const Home = () => {
  const { height, width } = useWindowDimensions();
  const { theme } = useUnistyles();
  const pageHeight = height;
  const { bottom, top } = useSafeAreaInsets();
  const arrowOffset = React.useRef(new Animated.Value(0)).current;
  const { saveMood } = useMood();

  // Отслеживание текущей страницы в горизонтальном скролле
  const [currentHorizontalPage, setCurrentHorizontalPage] = useState(0);
  const verticalScrollRef = useRef<ScrollView>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

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

  // Обработчик скролла горизонтального ScrollView
  const handleHorizontalScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setCurrentHorizontalPage(page);
  };

  // Блокируем вертикальный скролл, если пользователь на второй странице горизонтального скролла (TasksPage)
  const canScrollVertically = currentHorizontalPage === 0;

  const handleCloseBottomSheet = (isOpened: boolean) => {};

  const handleContinue = async (selectedTriggers: string[]) => {
    // selectedTriggers should have only one mood
    if (selectedTriggers.length > 0) {
      await saveMood(selectedTriggers[0] as MoodType, todayKey);
    }
  };

  return (
    <>
      {/* Вертикальный скролл для первой страницы */}
      <ScrollView
        ref={verticalScrollRef}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        snapToInterval={pageHeight}
        snapToOffsets={[pageHeight]}
        decelerationRate="fast"
        scrollEventThrottle={16}
        overScrollMode="never"
        scrollEnabled={canScrollVertically}
        onLayout={() => {}}
        style={{
          backgroundColor: theme.colors.background,
        }}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        contentInset={{ top: top, bottom: 0, left: 0, right: 0 }}
        contentContainerStyle={{
          paddingTop: top,
          paddingBottom: bottom,
          backgroundColor: theme.colors.background,
        }}
      >
        {/* Страница 1: Overview */}
        <OverviewPage arrowOffset={arrowOffset} />

        {/* Горизонтальный скролл для страниц 2 и 3 */}
        <View style={{ height: pageHeight }}>
          <ScrollView
            ref={horizontalScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={width}
            snapToAlignment="center"
            scrollEventThrottle={16}
            onScroll={handleHorizontalScroll}
            style={{
              backgroundColor: theme.colors.background,
            }}
          >
            <TasksListPage
              width={width}
              pageHeight={pageHeight}
              bottomInset={bottom}
            />
            {/* Страница 2: Tasks */}
            <View style={{ width }}>
              <TasksPage
                width={width}
                pageHeight={pageHeight}
                bottomInset={bottom}
              />
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <MoodBottomSheet
        onClose={handleCloseBottomSheet}
        onContinue={handleContinue}
        date={todayKey}
      />
    </>
  );
};
