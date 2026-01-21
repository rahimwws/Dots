import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { VideoView, useVideoPlayer } from "expo-video";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "@/shared/lib/supabase";
import { trackEvent, AnalyticsEvents, identifyUser } from "@/shared/lib/analytics";

const onboardingVideo = require("../../assets/video/onboarding.mp4");

export default function OnboardingScreen() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Track onboarding started when screen mounts
  useEffect(() => {
    trackEvent(AnalyticsEvents.ONBOARDING_STARTED);
  }, []);

  const player = useVideoPlayer(onboardingVideo, (instance) => {
    instance.loop = false;
    instance.muted = false;
    instance.volume = 1;
    instance.play();
  });

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("No identityToken received from Apple");
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (error) {
        console.error("Supabase auth error:", error);
        return;
      }

      // Apple only provides fullName on the first sign-in, save it to user metadata
      if (credential.fullName) {
        const fullName = [
          credential.fullName.givenName,
          credential.fullName.familyName,
        ]
          .filter(Boolean)
          .join(" ");

        if (fullName) {
          await supabase.auth.updateUser({
            data: {
              full_name: fullName,
              given_name: credential.fullName.givenName,
              family_name: credential.fullName.familyName,
            },
          });
        }
      }

      // Identify user in analytics with Supabase user ID
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        identifyUser(userData.user.id);
      }

      // Track successful authentication
      trackEvent(AnalyticsEvents.AUTH_COMPLETED, { method: "apple" });

      router.push("/onboarding/name");
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        // User cancelled the sign-in flow
      } else {
        console.error("Apple Sign-In error:", e);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />
      <View style={styles.overlay} />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 28,
          },
        ]}
      >
        <View style={styles.heroSpacer} />
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: "#fff" }]}>
            Progress starts
            {"\n"}with understanding.
          </Text>
          <Text style={[styles.subtitle, { color: "#fff" }]}>
            Most habits break not because of effort, but because of timing. We
            help you find your rhythm.
          </Text>
        </View>
        <GlassView
          isInteractive
          onTouchEnd={handleAppleSignIn}
          style={[styles.appleButton]}
        >
          <FontAwesome name="apple" size={20} color={theme.colors.text} />
          <Text style={[styles.appleButtonText, { color: theme.colors.text }]}>
            Continue with Apple
          </Text>
        </GlassView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
  },
  heroSpacer: {
    flex: 1,
  },
  textBlock: {
    gap: 12,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  title: {
    fontFamily: theme.fonts.primary,
    fontSize: 34,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: theme.fonts.primary,
    fontSize: 18,
    textAlign: "center",
    opacity: 0.85,
  },
  appleButton: {
    marginTop: 28,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 28,
  },
  appleButtonText: {
    fontFamily: theme.fonts.primary,
    fontSize: 18,
  },
}));
