import React from "react";
import { ScrollView, View, ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { PaywallHeader } from "./PaywallHeader";
import { SignatureCard } from "./SignatureCard";
import { FeaturesList } from "./FeaturesList";
import { PlanCard } from "./PlanCard";
import { PaywallFooter } from "./PaywallFooter";
import type { PaywallFeature } from "./FeatureItem";

interface PaywallContentProps {
  header: {
    overline: string;
    title: string;
    subtitle: string;
  };
  quote: {
    text: string;
    signatureLabel: string;
    signatureUri?: string | null;
    missingLabel: string;
  };
  features: PaywallFeature[];
  plan: {
    title: string;
    price: string;
    detail: string;
  };
  footer: {
    finePrint: string;
    onRestore: () => void;
    disabled?: boolean;
  };
  contentStyle?: ViewStyle;
}

/**
 * @description Scrollable paywall content block
 */
export const PaywallContent = ({
  header,
  quote,
  features,
  plan,
  footer,
  contentStyle,
}: PaywallContentProps) => {
  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      style={styles.scrollView}
    >
      <PaywallHeader
        overline={header.overline}
        title={header.title}
        subtitle={header.subtitle}
      />
      <SignatureCard
        quote={quote.text}
        signatureLabel={quote.signatureLabel}
        signatureUri={quote.signatureUri}
        missingLabel={quote.missingLabel}
      />
      <FeaturesList items={features} />
      <PlanCard title={plan.title} price={plan.price} detail={plan.detail} />
      <PaywallFooter
        finePrint={footer.finePrint}
        onRestore={footer.onRestore}
        disabled={footer.disabled}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create(() => ({
  scrollContent: {
    paddingBottom: 24,
    gap: 24,
  },
  scrollView: {
    flex: 1,
  },
}));
