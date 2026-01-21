import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import * as Haptics from "expo-haptics";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { ICON_CATEGORIES } from "../model/icon-categories";
import { IconGrid } from "./IconGrid";

interface IconPickerSheetProps {
  sheetRef: React.RefObject<TrueSheet>;
  onIconSelect: (iconName: string) => void;
  selectedIcon?: string;
}

/**
 * @description Bottom sheet for picking an icon from predefined categories
 */
export const IconPickerSheet: React.FC<IconPickerSheetProps> = ({
  sheetRef,
  onIconSelect,
  selectedIcon,
}) => {
  const { theme } = useUnistyles();
  const { height } = useWindowDimensions();
  const [activeCategory, setActiveCategory] = useState(ICON_CATEGORIES[0].id);

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(categoryId);
  };

  const handleIconSelect = (iconName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onIconSelect(iconName);
    sheetRef.current?.dismiss();
  };

  const current = ICON_CATEGORIES.find((cat) => cat.id === activeCategory) ?? ICON_CATEGORIES[0];

  return (
    <TrueSheet
      ref={sheetRef}
      dimmed
      detents={[0.4]}
      cornerRadius={50}
      grabber
      backgroundBlur="default"
      blurOptions={{ intensity: 80, interaction: true }}
      style={styles.sheetContainer}
    >
      <View style={{ height: height * 0.7 }}>
        <Text style={styles.title}>Select Icon</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {ICON_CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  {
                    borderColor: isActive ? theme.colors.text : theme.colors.border,
                    backgroundColor: isActive
                      ? theme.colors.backgroundTertiary
                      : theme.colors.backgroundSecondary,
                  },
                ]}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    { color: isActive ? theme.colors.text : theme.colors.textSecondary },
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          style={styles.iconsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.iconsScrollContent}
        >
          <IconGrid icons={current.icons} selectedIcon={selectedIcon} onSelect={handleIconSelect} />
        </ScrollView>
      </View>
    </TrueSheet>
  );
};

const styles = StyleSheet.create((theme) => ({
  sheetContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  title: {
    fontFamily: theme.fonts.primary,
    fontSize: 26,
    color: theme.colors.text,
    marginBottom: 20,
    fontWeight: "700",
  },
  categoryScroll: {
    marginBottom: 20,
    flexGrow: 0,
  },
  categoryScrollContent: {
    gap: 8,
    paddingRight: 20,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
  },
  categoryTabText: {
    fontFamily: theme.fonts.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  iconsContainer: {
    flex: 1,
  },
  iconsScrollContent: {
    paddingBottom: 50,
  },
}));
