import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { usePurchase } from "../model/use-purchase";

interface PurchaseButtonProps {
  label?: string;
  onSuccess?: () => void;
}

/**
 * @description Button that triggers RevenueCat purchase for the first available package
 */
export const PurchaseButton: React.FC<PurchaseButtonProps> = ({ label = "Go Pro", onSuccess }) => {
  const { theme } = useUnistyles();
  const { buyFirstAvailable, isLoading } = usePurchase();

  const handlePress = async () => {
    await buyFirstAvailable();
    onSuccess?.();
  };

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: theme.colors.buttonPrimary, borderRadius: theme.borderRadius.pill },
      ]}
      disabled={isLoading}
      onPress={handlePress}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.colors.buttonPrimaryText} />
      ) : (
        <Text style={[styles.label, { color: theme.colors.buttonPrimaryText }]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
  },
}));
