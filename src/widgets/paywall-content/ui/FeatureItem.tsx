import React from "react";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { SquircleView } from "expo-squircle-view";
import { Lucide } from "@react-native-vector-icons/lucide";

export interface PaywallFeature {
  title: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
}

interface FeatureItemProps {
  feature: PaywallFeature;
}

/**
 * @description Single paywall feature row
 */
export const FeatureItem = ({ feature }: FeatureItemProps) => {
  const { theme } = useUnistyles();

  return (
    <SquircleView
      borderRadius={16}
      cornerSmoothing={80}
      preserveSmoothing
      style={[styles.row, { borderColor: theme.colors.border }]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: theme.colors.backgroundSecondary }]}
      >
        <Lucide name={feature.icon as never} size={20} color={theme.colors.text} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{feature.title}</Text>
          {feature.comingSoon ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.backgroundSecondary }]}
            >
              <Text style={[styles.badgeText, { color: theme.colors.textTertiary }]}
              >
                Coming soon
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}
        >
          {feature.description}
        </Text>
      </View>
    </SquircleView>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 16,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  title: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontFamily: theme.fonts.primary,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  description: {
    fontFamily: theme.fonts.primary,
    fontSize: 13,
    lineHeight: 18,
  },
}));
