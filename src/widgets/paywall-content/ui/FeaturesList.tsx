import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { PaywallFeature } from "./FeatureItem";
import { FeatureItem } from "./FeatureItem";

interface FeaturesListProps {
  items: PaywallFeature[];
}

/**
 * @description Paywall feature list
 */
export const FeaturesList = ({ items }: FeaturesListProps) => {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <FeatureItem key={item.title} feature={item} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  container: {
    gap: 14,
  },
}));
