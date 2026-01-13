import React from "react";
import { Text, View, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SvgProps } from "react-native-svg";

export type TextSegment =
  | { type: "text"; content: string; bold?: boolean }
  | { type: "icon"; name?: keyof typeof Ionicons.glyphMap; size?: number }
  | {
      type: "svg";
      component: React.ComponentType<
        SvgProps & { size?: number; color?: string }
      >;
      size?: number;
    };

export interface TextWithIconsProps {
  segments: TextSegment[];
  style?: ViewStyle;
  textStyle?: TextStyle;
  boldTextStyle?: TextStyle;
  iconColor?: string;
}

export const TextWithIcons: React.FC<TextWithIconsProps> = ({
  segments,
  style,
  textStyle,
  boldTextStyle,
  iconColor = "#1F1F1F",
}) => {
  // Получаем размер шрифта из стилей (приоритет: переданный стиль > базовый)
  const baseFontSize = textStyle?.fontSize || 16;
  const boldFontSize = boldTextStyle?.fontSize || baseFontSize;

  // Вычисляем offset для выравнивания иконок по тексту
  // Иконки должны быть визуально выровнены по центру строчных букв (x-height)
  const getIconOffset = (iconSize: number, fontSize: number) => {
    // X-height обычно находится на 50-55% от размера шрифта от верха строки
    // Используем 0.52 для лучшего визуального выравнивания со строчными буквами
    const xHeightCenter = fontSize * 0.52;
    // Смещаем иконку вниз, чтобы её центр совпал с центром x-height
    return xHeightCenter - iconSize / 2;
  };

  const renderContent = () => {
    const elements: React.ReactNode[] = [];

    segments.forEach((segment, index) => {
      if (segment.type === "icon" || segment.type === "svg") {
        const iconSize = segment.size || baseFontSize; // По умолчанию размер равен размеру шрифта
        // Определяем какой шрифт используется перед/после иконки для правильного выравнивания
        const prevSegment = segments[index - 1];
        const nextSegment = segments[index + 1];
        const fontSizeForAlignment =
          (prevSegment?.type === "text" && prevSegment.bold) ||
          (nextSegment?.type === "text" && nextSegment.bold)
            ? boldFontSize
            : baseFontSize;

        const iconOffset = getIconOffset(iconSize, fontSizeForAlignment);

        if (segment.type === "svg") {
          const SvgIcon = segment.component;
          elements.push(
            <View
              key={`svg-icon-${index}`}
              style={[
                styles.icon,
                {
                  marginTop: iconOffset,
                  width: iconSize,
                  height: iconSize,
                },
              ]}
            >
              <SvgIcon
                width={iconSize}
                height={iconSize}
                color={iconColor}
                size={iconSize}
              />
            </View>
          );
        } else if (segment.name) {
          elements.push(
            <Ionicons
              key={`icon-${index}`}
              name={segment.name}
              size={iconSize}
              color={iconColor}
              style={[
                styles.icon,
                {
                  marginTop: iconOffset,
                },
              ]}
            />
          );
        }
      } else {
        const parts = segment.content.split("\n");
        parts.forEach((part, partIndex) => {
          if (partIndex > 0) {
            elements.push(
              <Text key={`break-${index}-${partIndex}`}>{"\n"}</Text>
            );
          }
          if (part) {
            elements.push(
              <Text
                key={`text-${index}-${partIndex}`}
                style={[
                  segment.bold ? styles.boldText : styles.regularText,
                  segment.bold ? boldTextStyle : textStyle,
                ]}
              >
                {part}
              </Text>
            );
          }
        });
      }
    });

    return elements;
  };

  return <View style={[styles.container, style]}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  regularText: {
    fontFamily: "is-r",
    fontSize: 16,
    color: "#999999",
  },
  boldText: {
    fontFamily: "is-r",
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  icon: {
    marginHorizontal: 4,
    // marginTop вычисляется динамически в renderContent
  },
});
