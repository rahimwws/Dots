import React from "react";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface PlanCardProps {
  title: string;
  price: string;
  detail: string;
}

/**
 * @description Pricing plan card
 */
export const PlanCard = ({ title, price, detail }: PlanCardProps) => {
  const { theme } = useUnistyles();

  return (
    <View style={[styles.card, { borderColor: theme.colors.border }]}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.price, { color: theme.colors.text }]}>{price}</Text>
      </View>
      <Text style={[styles.detail, { color: theme.colors.textSecondary }]}>{detail}</Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: theme.fonts.primary,
    fontSize: 18,
  },
  price: {
    fontFamily: theme.fonts.primary,
    fontSize: 18,
  },
  detail: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
  },
}));
