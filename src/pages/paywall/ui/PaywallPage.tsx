import React from "react";
import { ActivityIndicator, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { PaywallContent } from "@/widgets/paywall-content";
import { FEATURE_ITEMS, PAYWALL_COPY } from "../model/constants";
import { usePaywall } from "../model/use-paywall";
import { PurchaseButton } from "@/features/purchase-subscription";

interface PaywallPageProps {
  onComplete?: "tabs" | "back";
}

/**
 * @description Paywall screen with purchase flow
 */
export const PaywallPage = ({ onComplete = "tabs" }: PaywallPageProps) => {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleCompletion = () => {
    if (onComplete === "back") {
      router.back();
      return;
    }
    router.replace("/(tabs)" as any);
  };

  const {
    signature,
    priceString,
    isLoading,
    handleRestore,
    hasPackages,
  } = usePaywall({ onComplete: handleCompletion });

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: 20,
          paddingBottom: insets.bottom,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <StatusBar style={theme.colors.text === "#FFFFFF" ? "light" : "dark"} />

      <PaywallContent
        contentStyle={{ paddingBottom: 24 }}
        header={{
          overline: PAYWALL_COPY.overline,
          title: PAYWALL_COPY.title,
          subtitle: `A paid app. ${priceString} / month because it is worth it.`,
        }}
        quote={{
          text: PAYWALL_COPY.quote,
          signatureLabel: PAYWALL_COPY.signatureLabel,
          signatureUri: signature,
          missingLabel: PAYWALL_COPY.signatureMissing,
        }}
        features={FEATURE_ITEMS}
        plan={{
          title: "Monthly",
          price: priceString,
          detail: `3-day free trial, then ${priceString} / month.`,
        }}
        footer={{
          finePrint: PAYWALL_COPY.finePrint,
          onRestore: handleRestore,
          disabled: isPurchasing,
        }}
      />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom - 20 }]}>
        <PurchaseButton label="Start free 3-day trial" onSuccess={handleCompletion} />
      </View>

      {isLoading && !hasPackages ? (
        <ActivityIndicator color={theme.colors.text} style={styles.loader} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  bottomBar: {
    paddingTop: 16,
    gap: 10,
  },
  loader: {
    position: "absolute",
    top: 20,
    right: 20,
  },
}));
