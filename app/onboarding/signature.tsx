import { Text, View, StyleSheet, Pressable } from "react-native";
import { useUnistyles } from "react-native-unistyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useRef, useState } from "react";
import { GlassView } from "expo-glass-effect";
import SignatureCanvas, {
  SignatureViewRef,
} from "react-native-signature-canvas";
import { useSignature } from "@/features/capture-signature";
import Icon from "@react-native-vector-icons/lucide";
import { SquircleView } from "expo-squircle-view";
import { useRouter } from "expo-router";
import { trackEvent, AnalyticsEvents } from "@/shared/lib/analytics";

const SIGNATURE_WEB_STYLE = `
  body,html {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: #FFFFFF;

  }
  .m-signature-pad {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #FFFFFF;
    border-width: 0;
  }
  .m-signature-pad--body {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border: none;
    background-color: #FFFFFF;

  }
  .m-signature-pad--body canvas {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    background-color: #FFFFFF;

  }
  .m-signature-pad--footer,
  button,
  .button,
  .m-signature-pad--footer button {
    display: none !important;

  }
`;

export default function OnboardingSignatureScreen() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const { signature, saveSignature } = useSignature();
  const router = useRouter();
  const signatureRef = useRef<SignatureViewRef>(null);
  const [hasSignature, setHasSignature] = useState(Boolean(signature));

  const nextEnabled = hasSignature;

  const handleSave = useCallback(
    async (signatureData: string) => {
      if (!signatureData) return;
      await saveSignature(signatureData);
      setHasSignature(true);

      // Track signature created event
      trackEvent(AnalyticsEvents.SIGNATURE_CREATED);

      router.push("/onboarding/paywall");
    },
    [router, saveSignature]
  );

  const handleFinish = useCallback(() => {
    signatureRef.current?.readSignature();
  }, []);

  const handleEnd = useCallback(() => {
    setHasSignature(true);
  }, []);

  const handleClear = useCallback(() => {
    signatureRef.current?.clearSignature();
    setHasSignature(false);
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.text, fontFamily: theme.fonts.primary },
          ]}
        >
          The clarity you want begins with noticing.
        </Text>

        <SquircleView
          borderRadius={20}
          cornerSmoothing={80}
          preserveSmoothing
          borderWidth={1}
          borderColor={theme.colors.border}
          style={styles.signatureWrapper}
        >
          <View style={styles.signatureHeader}>
            <Pressable onPress={handleClear} style={styles.headerButton}>
              <Icon
                name="refresh-cw"
                size={22}
                color={theme.colors.textQuaternary}
              />
            </Pressable>
          </View>

          <View style={styles.signatureContainer}>
            <SignatureCanvas
              ref={signatureRef}
              onOK={handleSave}
              onEnd={handleEnd}
              descriptionText=""
              clearText=""
              confirmText=""
              webStyle={SIGNATURE_WEB_STYLE}
              autoClear={false}
              imageType="image/png"
              penColor="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>
        </SquircleView>
      </View>

      <GlassView
        isInteractive
        glassEffectStyle="clear"
        onTouchEnd={handleFinish}
        style={[
          styles.nextButton,
          {
            backgroundColor: nextEnabled
              ? theme.colors.buttonPrimary
              : theme.colors.backgroundQuaternary,
          },
        ]}
      >
        <Text
          style={[
            styles.nextButtonText,
            {
              fontFamily: theme.fonts.primary,
              color: nextEnabled
                ? theme.colors.buttonPrimaryText
                : theme.colors.textSecondary,
            },
          ]}
        >
          Sign in
        </Text>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  title: {
    fontSize: 26,
    textAlign: "center",
  },
  signatureWrapper: {
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    padding: 5,
    borderRadius: 16,
    overflow: "hidden",
  },
  signatureHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 4,
  },
  signatureTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  signatureContainer: {
    height: 200,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  pencilIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  nextButton: {
    marginTop: "auto",
    borderRadius: 999,
    paddingVertical: 25,
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 22,
  },
});
