import React from "react";
import { Text, View, TextStyle, ViewStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Ionicons } from "@expo/vector-icons";
import type { SvgProps } from "react-native-svg";

export type TextSegment =
  | { type: "text"; content: string; bold?: boolean }
  | { type: "icon"; name?: keyof typeof Ionicons.glyphMap; size?: number }
  | {
      type: "svg";
      component: React.ComponentType<SvgProps & { size?: number; color?: string }>;
      size?: number;
    };

export interface TextWithIconsProps {
  segments: TextSegment[];
  style?: ViewStyle;
  textStyle?: TextStyle;
  boldTextStyle?: TextStyle;
  iconColor?: string;
}

/**
 * @description Renders text with inline icons and SVG support
 * @param segments - Array of text/icon/svg segments to render
 * @param style - Container style
 * @param textStyle - Regular text style
 * @param boldTextStyle - Bold text style
 * @param iconColor - Color for icons
 */
export const TextWithIcons: React.FC<TextWithIconsProps> = ({
  segments,
  style,
  textStyle,
  boldTextStyle,
  iconColor,
}) => {
  const { theme } = useUnistyles();
  const finalIconColor = iconColor || theme.colors.text;
  const baseFontSize = textStyle?.fontSize || 16;
  const boldFontSize = boldTextStyle?.fontSize || baseFontSize;

  /** Calculate vertical offset to align icon with text x-height */
  const getIconOffset = (iconSize: number, fontSize: number) => {
    const xHeightCenter = fontSize * 0.52;
    return xHeightCenter - iconSize / 2;
  };

  const renderContent = () => {
    const elements: React.ReactNode[] = [];

    segments.forEach((segment, index) => {
      if (segment.type === "icon" || segment.type === "svg") {
        const iconSize = segment.size || baseFontSize;
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
              style={[styles.icon, { marginTop: iconOffset, width: iconSize, height: iconSize }]}
            >
              <SvgIcon width={iconSize} height={iconSize} color={finalIconColor} size={iconSize} />
            </View>
          );
        } else if (segment.name) {
          elements.push(
            <Ionicons
              key={`icon-${index}`}
              name={segment.name}
              size={iconSize}
              color={finalIconColor}
              style={[styles.icon, { marginTop: iconOffset }]}
            />
          );
        }
      } else {
        const parts = segment.content.split("\n");
        parts.forEach((part, partIndex) => {
          if (partIndex > 0) {
            elements.push(<Text key={`break-${index}-${partIndex}`}>{"\n"}</Text>);
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

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  regularText: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    color: theme.colors.icon,
  },
  boldText: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  icon: {
    marginHorizontal: 4,
  },
}));
