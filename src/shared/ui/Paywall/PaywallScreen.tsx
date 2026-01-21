import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSubscription } from "@/entities/subscription";
import type { PurchasesPackage } from "react-native-purchases";
import { StyleSheet as UniStyleSheet, useUnistyles } from "react-native-unistyles";
import { Lucide } from "@react-native-vector-icons/lucide";

interface PaywallScreenProps {
  onDismiss?: () => void;
  onSuccess?: () => void;
}

export const PaywallScreen = ({ onDismiss, onSuccess }: PaywallScreenProps) => {
  const {
    packages,
    isLoading,
    purchasePackage,
    restorePurchases,
    getPackages,
  } = useSubscription();
  
  const { theme } = useUnistyles();
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    // Load packages if not already loaded
    if (packages.length === 0) {
      getPackages().catch((err) => {
        console.error("Failed to load packages:", err);
      });
    } else if (!selectedPackage) {
      // Auto-select yearly package by default
      const yearlyPackage = packages.find((pkg) =>
        pkg.product.identifier.includes("yearly")
      );
      setSelectedPackage(yearlyPackage || packages[0] || null);
    }
  }, [packages, selectedPackage, getPackages]);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert("Error", "Please select a subscription plan");
      return;
    }

    try {
      setIsPurchasing(true);
      await purchasePackage(selectedPackage);
      onSuccess?.();
      onDismiss?.();
    } catch (error: any) {
      if (!error?.userCancelled) {
        console.error("Purchase failed:", error);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsPurchasing(true);
      await restorePurchases();
      onSuccess?.();
      onDismiss?.();
    } catch (error) {
      console.error("Restore failed:", error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const formatPrice = (pkg: PurchasesPackage) => {
    return pkg.product.priceString;
  };

  const getPackageTitle = (pkg: PurchasesPackage) => {
    if (pkg.product.identifier.includes("yearly")) {
      return "Yearly";
    } else if (pkg.product.identifier.includes("monthly")) {
      return "Monthly";
    }
    return pkg.packageType;
  };

  const getPackageDescription = (pkg: PurchasesPackage) => {
    if (pkg.product.identifier.includes("yearly")) {
      return "Best value - Save up to 40%";
    } else if (pkg.product.identifier.includes("monthly")) {
      return "Flexible monthly billing";
    }
    return pkg.product.description;
  };

  const isYearlyBestValue = (pkg: PurchasesPackage) => {
    return pkg.product.identifier.includes("yearly");
  };

  if (isLoading && packages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.text} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading subscription options...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {onDismiss && (
        <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
          <Lucide name="x" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Upgrade to Pro
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Unlock all premium features
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <FeatureItem
          icon="infinity"
          title="Unlimited Tasks"
          description="Create as many tasks as you need"
          theme={theme}
        />
        <FeatureItem
          icon="bar-chart-2"
          title="Advanced Insights"
          description="Get detailed analytics about your productivity"
          theme={theme}
        />
        <FeatureItem
          icon="cloud"
          title="Cloud Sync"
          description="Sync across all your devices"
          theme={theme}
        />
        <FeatureItem
          icon="headphones"
          title="Priority Support"
          description="Get help when you need it"
          theme={theme}
        />
      </View>

      {/* Subscription Packages */}
      <View style={styles.packagesContainer}>
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.identifier}
            style={[
              styles.packageCard,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor:
                  selectedPackage?.identifier === pkg.identifier
                    ? theme.colors.text
                    : theme.colors.border,
              },
              selectedPackage?.identifier === pkg.identifier &&
                styles.packageCardSelected,
            ]}
            onPress={() => setSelectedPackage(pkg)}
            disabled={isPurchasing}
          >
            {isYearlyBestValue(pkg) && (
              <View style={[styles.badge, { backgroundColor: theme.colors.buttonPrimary }]}>
                <Text style={[styles.badgeText, { color: theme.colors.buttonPrimaryText }]}>
                  Best Value
                </Text>
              </View>
            )}

            <View style={styles.packageHeader}>
              <Text style={[styles.packageTitle, { color: theme.colors.text }]}>
                {getPackageTitle(pkg)}
              </Text>
              <Text style={[styles.packagePrice, { color: theme.colors.text }]}>
                {formatPrice(pkg)}
              </Text>
            </View>

            <Text style={[styles.packageDescription, { color: theme.colors.textSecondary }]}>
              {getPackageDescription(pkg)}
            </Text>

            <View style={styles.checkmarkContainer}>
              {selectedPackage?.identifier === pkg.identifier && (
                <Lucide name="check-circle" size={24} color={theme.colors.text} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Purchase Button */}
      <TouchableOpacity
        style={[
          styles.purchaseButton,
          { backgroundColor: theme.colors.buttonPrimary },
          isPurchasing && styles.purchaseButtonDisabled,
        ]}
        onPress={handlePurchase}
        disabled={isPurchasing || !selectedPackage}
      >
        {isPurchasing ? (
          <ActivityIndicator color={theme.colors.buttonPrimaryText} />
        ) : (
          <Text style={[styles.purchaseButtonText, { color: theme.colors.buttonPrimaryText }]}>
            Start Free Trial
          </Text>
        )}
      </TouchableOpacity>

      {/* Restore Button */}
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        disabled={isPurchasing}
      >
        <Text style={[styles.restoreButtonText, { color: theme.colors.textSecondary }]}>
          Restore Purchases
        </Text>
      </TouchableOpacity>

      {/* Fine Print */}
      <View style={styles.finePrintContainer}>
        <Text style={[styles.finePrint, { color: theme.colors.textSecondary }]}>
          Subscription automatically renews unless auto-renew is turned off at least 24 hours
          before the end of the current period. Manage subscriptions in your App Store settings.
        </Text>
      </View>
    </ScrollView>
  );
};

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  theme: any;
}

const FeatureItem = ({ icon, title, description, theme }: FeatureItemProps) => (
  <View style={styles.featureItem}>
    <View style={[styles.featureIcon, { backgroundColor: theme.colors.backgroundTertiary }]}>
      <Lucide name={icon as any} size={20} color={theme.colors.text} />
    </View>
    <View style={styles.featureContent}>
      <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
  },
  packagesContainer: {
    marginBottom: 24,
  },
  packageCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    position: "relative",
  },
  packageCardSelected: {
    borderWidth: 2,
  },
  badge: {
    position: "absolute",
    top: -10,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: "700",
  },
  packageDescription: {
    fontSize: 14,
  },
  checkmarkContainer: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  purchaseButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  restoreButtonText: {
    fontSize: 14,
  },
  finePrintContainer: {
    paddingTop: 16,
  },
  finePrint: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});
