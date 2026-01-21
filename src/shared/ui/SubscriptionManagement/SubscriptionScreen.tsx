import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useSubscription } from "@/entities/subscription";
import { PaywallScreen } from "@/shared/ui/Paywall";

interface SubscriptionScreenProps {
  onDismiss?: () => void;
}

export const SubscriptionScreen = ({ onDismiss }: SubscriptionScreenProps) => {
  const {
    customerInfo,
    isProUser,
    isLoading,
    restorePurchases,
  } = useSubscription();
  
  const [showPaywall, setShowPaywall] = useState(false);

  const handleRestorePurchases = async () => {
    try {
      await restorePurchases();
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const handleManageSubscription = () => {
    // Open App Store subscription management
    Alert.alert(
      "Manage Subscription",
      "To manage your subscription, please go to your App Store settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => {
            // In a real app, you would use Linking.openURL to open the App Store settings
            console.log("Opening App Store settings...");
          },
        },
      ]
    );
  };

  const handleUpgrade = () => {
    setShowPaywall(true);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading subscription info...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {onDismiss && (
        <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Subscription</Text>
      </View>

      {/* Subscription Status */}
      <View style={styles.section}>
        <View
          style={[
            styles.statusCard,
            isProUser ? styles.statusCardActive : styles.statusCardInactive,
          ]}
        >
          <Text style={styles.statusTitle}>
            {isProUser ? "3 Dots Pro" : "Free Plan"}
          </Text>
          <Text style={styles.statusDescription}>
            {isProUser
              ? "You have access to all premium features"
              : "Upgrade to unlock all features"}
          </Text>

          {isProUser && customerInfo?.subscriptionStatus.expirationDate && (
            <View style={styles.expirationContainer}>
              <Text style={styles.expirationLabel}>
                {customerInfo.subscriptionStatus.willRenew
                  ? "Renews on:"
                  : "Expires on:"}
              </Text>
              <Text style={styles.expirationDate}>
                {formatDate(customerInfo.subscriptionStatus.expirationDate)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        {isProUser ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleManageSubscription}
            >
              <Text style={styles.primaryButtonText}>Manage Subscription</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRestorePurchases}
            >
              <Text style={styles.secondaryButtonText}>Restore Purchases</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleUpgrade}
            >
              <Text style={styles.primaryButtonText}>Upgrade to Pro</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRestorePurchases}
            >
              <Text style={styles.secondaryButtonText}>Restore Purchases</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Features List */}
      {!isProUser && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pro Features</Text>

          <View style={styles.featuresList}>
            <FeatureItem
              icon="✓"
              title="Unlimited Tasks"
              description="Create as many tasks as you need"
            />
            <FeatureItem
              icon="✓"
              title="Advanced Insights"
              description="Get detailed analytics and insights"
            />
            <FeatureItem
              icon="✓"
              title="Cloud Sync"
              description="Sync across all your devices"
            />
            <FeatureItem
              icon="✓"
              title="Priority Support"
              description="Get help when you need it"
            />
          </View>
        </View>
      )}

      {/* Subscription Details */}
      {isProUser && customerInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Details</Text>

          <View style={styles.detailsCard}>
            {customerInfo.subscriptionStatus.productIdentifier && (
              <DetailRow
                label="Plan"
                value={
                  customerInfo.subscriptionStatus.productIdentifier.includes(
                    "yearly"
                  )
                    ? "Yearly"
                    : "Monthly"
                }
              />
            )}

            <DetailRow
              label="Auto-Renew"
              value={customerInfo.subscriptionStatus.willRenew ? "On" : "Off"}
            />

            {customerInfo.originalAppUserId && (
              <DetailRow
                label="User ID"
                value={customerInfo.originalAppUserId}
              />
            )}
          </View>
        </View>
      )}

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Subscriptions can be managed through your App Store account settings.
        </Text>
        <Text style={styles.infoText}>
          Use Restore Purchases if you've purchased on another device.
        </Text>
      </View>

      {/* Paywall Modal */}
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaywall(false)}
      >
        <PaywallScreen
          onDismiss={() => setShowPaywall(false)}
          onSuccess={() => {
            setShowPaywall(false);
          }}
        />
      </Modal>
    </ScrollView>
  );
};

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem = ({ icon, title, description }: FeatureItemProps) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666666",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000000",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  statusCardActive: {
    borderWidth: 2,
    borderColor: "#34C759",
  },
  statusCardInactive: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: "#666666",
  },
  expirationContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  expirationLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  expirationDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  featuresList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    color: "#34C759",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#666666",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  infoText: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 18,
  },
});
