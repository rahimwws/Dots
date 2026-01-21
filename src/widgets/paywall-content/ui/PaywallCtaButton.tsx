import React from "react";
import { ActivityIndicator, Text } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { GlassView } from "expo-glass-effect";

interface PaywallCtaButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * @description Paywall call-to-action button
 */
export const PaywallCtaButton = ({
  label,
  onPress,
  disabled,
  loading,
}: PaywallCtaButtonProps) => {
  const { theme } = useUnistyles();
  const isDisabled = disabled || loading;

  return (
    <GlassView
      isInteractive
      glassEffectStyle="clear"
      onTouchEnd={onPress}
      style={[
        styles.button,
        {
          backgroundColor: !isDisabled
            ? theme.colors.buttonPrimary
            : theme.colors.backgroundQuaternary,
        },
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.buttonPrimaryText} />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color: !isDisabled
                ? theme.colors.buttonPrimaryText
                : theme.colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </GlassView>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    borderRadius: 999,
    paddingVertical: 22,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.7,
  },
  label: {
    fontFamily: theme.fonts.primary,
    fontSize: 20,
  },
}));
