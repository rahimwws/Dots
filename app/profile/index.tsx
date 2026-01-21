import {
  ScrollView,
  Switch,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  StyleSheet,
  useUnistyles,
  withUnistyles,
} from "react-native-unistyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useSubscription } from "@/entities/subscription";
import { SubscriptionScreen } from "@/shared/ui/SubscriptionManagement";
import { SquircleView, SquircleButton } from "expo-squircle-view";
import { router } from "expo-router";
import { useOnboarding } from "@/entities/user";

const UniSquircleView = withUnistyles(SquircleView);
const UniButton = withUnistyles(SquircleButton);
export default function Profile() {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const { isProUser, restorePurchases } = useSubscription();
  const { resetOnboarding } = useOnboarding();
  const [showSubscription, setShowSubscription] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [habitReminders, setHabitReminders] = useState(true);
  const [motivation, setMotivation] = useState(true);
  const [weeklyCheckIn, setWeeklyCheckIn] = useState(true);

  const toggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    if (!value) {
      setHabitReminders(false);
      setMotivation(false);
      setWeeklyCheckIn(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      await restorePurchases();
    } catch (error) {
      console.error("Restore purchases failed:", error);
    }
  };

  const handleUpgradePress = () => {
    router.push("/paywall");
  };

  const handleAccountPress = () => {
    // Пока нет отдельного экрана, оставляем заглушку
    console.log("Account pressed");
  };

  const handleSignOut = async () => {
    console.log("f");

    await resetOnboarding();
    router.replace("/onboarding");
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: 20,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* <View style={styles.headerBar}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Rahim
          </Text>
        </View> */}

        <UniSquircleView
          cornerSmoothing={80}
          borderRadius={25}
          style={styles.subscriptionCard}
        >
          <Text style={styles.subscriptionTitle}>
            {isProUser
              ? "Thanks for being Pro"
              : "Upgrade the app and get more"}
          </Text>
          <Text style={styles.subscriptionDescription}>
            {isProUser
              ? "You have full access to Habit features."
              : "Upgrade the app and get more out of your habits with Pro"}
          </Text>
          <UniButton
            cornerSmoothing={80}
            borderRadius={15}
            style={styles.subscriptionButton}
            onPress={handleUpgradePress}
          >
            <Text style={styles.subscriptionButtonText}>
              {isProUser ? "Manage Subscription" : "Upgrade to Pro"}
            </Text>
          </UniButton>
        </UniSquircleView>

        <TouchableOpacity
          onPress={handleRestorePurchases}
          style={styles.restoreButton}
        >
          <Text style={[styles.restoreText, { color: theme.colors.text }]}>
            Restore Purchases
          </Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
            General
          </Text>
          <UniButton
            preserveSmoothing
            cornerSmoothing={80}
            borderRadius={15}
            activeOpacity={0.8}
            style={[
              styles.listItem,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={handleAccountPress}
          >
            <View style={styles.listItemLeft}>
              <Lucide name="user" size={18} color={theme.colors.text} />
              <Text style={[styles.listItemText, { color: theme.colors.text }]}>
                Account
              </Text>
            </View>
            <Lucide
              name="chevron-right"
              size={16}
              color={theme.colors.textSecondary}
            />
          </UniButton>
        </View>

        <UniSquircleView
          preserveSmoothing
          cornerSmoothing={80}
          borderRadius={15}
          style={styles.section}
        >
          <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
            Notifications
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            Choose the types of notifications and reminders you want to get from
            Habit
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <SettingToggle
              label="Enable Notifications"
              value={notificationsEnabled}
              onChange={toggleNotifications}
              themeColors={theme.colors}
            />
            <SettingToggle
              label="Habit Reminders"
              value={habitReminders}
              disabled={!notificationsEnabled}
              onChange={setHabitReminders}
              themeColors={theme.colors}
            />
            <SettingToggle
              label="Motivation"
              value={motivation}
              disabled={!notificationsEnabled}
              onChange={setMotivation}
              themeColors={theme.colors}
            />
            <SettingToggle
              label="Weekly Check-in"
              value={weeklyCheckIn}
              disabled={!notificationsEnabled}
              onChange={setWeeklyCheckIn}
              themeColors={theme.colors}
              isLast
            />
          </View>
        </UniSquircleView>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showSubscription}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSubscription(false)}
      >
        <SubscriptionScreen onDismiss={() => setShowSubscription(false)} />
      </Modal>
    </View>
  );
}

type ToggleProps = {
  label: string;
  value: boolean;
  disabled?: boolean;
  isLast?: boolean;
  onChange: (value: boolean) => void;
  themeColors: {
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    background: string;
    backgroundSecondary: string;
  };
};

const SettingToggle = ({
  label,
  value,
  disabled,
  onChange,
  isLast,
  themeColors,
}: ToggleProps) => {
  return (
    <View
      style={[
        styles.toggleRow,
        !isLast && {
          borderBottomColor: themeColors.border,
          borderBottomWidth: 1,
        },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={[styles.toggleLabel, { color: themeColors.text }]}>
        {label}
      </Text>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{
          false: themeColors.border,
          true: themeColors.accent,
        }}
        thumbColor={value ? themeColors.background : themeColors.textSecondary}
        ios_backgroundColor={themeColors.border}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 24,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconPlaceholder: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    fontFamily: theme.fonts.primary,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  subscriptionCard: {
    borderRadius: 18,
    padding: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  subscriptionGlow: {
    position: "absolute",
    top: -40,
    right: -60,
    width: 180,
    height: 180,
    backgroundColor: "rgba(138, 240, 176, 0.14)",
    borderRadius: 180,
  },
  subscriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  badgeText: {
    color: "#8AF0B0",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  closeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBadgeText: {
    color: "#D0DAD6",
    fontSize: 16,
  },
  subscriptionTitle: {
    fontFamily: theme.fonts.primary,
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6,
  },
  subscriptionDescription: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  subscriptionButton: {
    backgroundColor: theme.colors.backgroundSuccessSoft,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  subscriptionButtonText: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F2A1F",
  },
  restoreButton: {
    alignItems: "center",
  },
  restoreText: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
    opacity: 0.9,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  sectionDescription: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listItemText: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  toggleLabel: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  signOutButton: {
    marginTop: 12,
    backgroundColor: "#2A0F10",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  signOutText: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
    color: "#FF4D4F",
  },
}));
