import "../unistyles";

import { SplashScreen, Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFonts } from "expo-font";
import { vexo } from "vexo-analytics";
import { WithProviders } from "@/app/providers";
import { useOnboarding } from "@/entities/user";
import { Toaster } from "sonner-native";
import {
  Animated,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";

// Initialize Vexo analytics
vexo("aeb01da3-5431-44dd-989c-beb98c3bd379");

SplashScreen.preventAutoHideAsync();

// Splash images
const splashLight = require("../assets/splash-light.png");
const splashDark = require("../assets/splash-dark.png");

function AnimatedSplashScreen({
  children,
  isAppReady,
}: {
  children: React.ReactNode;
  isAppReady: boolean;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const splashImage = isDark ? splashDark : splashLight;
  const backgroundColor = isDark ? "#000" : "#fff";

  const opacity = useMemo(() => new Animated.Value(1), []);
  const scale = useMemo(() => new Animated.Value(1), []);

  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    if (isAppReady && !animationStarted) {
      setAnimationStarted(true);
      // Hide the native splash screen first
      SplashScreen.hideAsync();

      // Small delay to ensure smooth transition
      setTimeout(() => {
        // Start the animation
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 2.5,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => setAnimationComplete(true));
      }, 100);
    }
  }, [isAppReady, animationStarted, opacity, scale]);

  return (
    <View style={styles.container}>
      {children}
      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.splashContainer,
            {
              backgroundColor,
              opacity,
            },
          ]}
        >
          <Animated.Image
            source={splashImage}
            style={[
              styles.splashImage,
              {
                transform: [{ scale }],
              },
            ]}
            fadeDuration={0}
            resizeMode="contain"
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  splashImage: {
    width: 150,
    height: 150,
  },
});

function NavigationController({
  onReady,
}: {
  onReady: () => void;
}) {
  const { hasCompletedOnboarding, isLoading } = useOnboarding();
  const [hasCalledReady, setHasCalledReady] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasCalledReady) {
      setHasCalledReady(true);
      onReady();
    }
  }, [isLoading, hasCalledReady, onReady]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!hasCompletedOnboarding}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      <Stack.Protected guard={!!hasCompletedOnboarding}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" options={{ presentation: "modal" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "is-r": require("../assets/fonts/InstrumentSerif-Regular.ttf"),
  });
  const [isAppReady, setAppReady] = useState(false);

  const onReady = useCallback(() => {
    setAppReady(true);
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AnimatedSplashScreen isAppReady={isAppReady}>
      <WithProviders>
        <NavigationController onReady={onReady} />
        <Toaster />
      </WithProviders>
    </AnimatedSplashScreen>
  );
}
