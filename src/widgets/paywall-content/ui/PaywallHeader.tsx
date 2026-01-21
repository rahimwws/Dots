import React from "react";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface PaywallHeaderProps {
  overline: string;
  title: string;
  subtitle: string;
}

/**
 * @description Paywall header with title and subtitle
 */
export const PaywallHeader = ({ overline, title, subtitle }: PaywallHeaderProps) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.header}>
      <Text style={[styles.overline, { color: theme.colors.textTertiary }]}>{overline}</Text>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  header: {
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  overline: {
    fontFamily: theme.fonts.primary,
    letterSpacing: 3,
    fontSize: 11,
  },
  title: {
    fontFamily: theme.fonts.primary,
    fontSize: 30,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
}));
