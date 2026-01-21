import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface PaywallFooterProps {
  onRestore: () => void;
  disabled?: boolean;
  finePrint: string;
}

/**
 * @description Paywall restore and fine print footer
 */
export const PaywallFooter = ({ onRestore, disabled, finePrint }: PaywallFooterProps) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onRestore} disabled={disabled} style={styles.restoreButton}>
        <Text style={[styles.restoreText, { color: theme.colors.textTertiary }]}>
          Restore purchases
        </Text>
      </TouchableOpacity>
      <Text style={[styles.finePrint, { color: theme.colors.textTertiary }]}>{finePrint}</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: 16,
  },
  restoreButton: {
    alignItems: "center",
  },
  restoreText: {
    fontFamily: theme.fonts.primary,
    fontSize: 13,
  },
  finePrint: {
    fontFamily: theme.fonts.primary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
}));
