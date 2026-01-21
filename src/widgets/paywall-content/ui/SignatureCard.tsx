import React from "react";
import { Image, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { SquircleView } from "expo-squircle-view";

interface SignatureCardProps {
  quote: string;
  signatureUri?: string | null;
  missingLabel: string;
  signatureLabel: string;
}

/**
 * @description Quote card with user's signature
 */
export const SignatureCard = ({
  quote,
  signatureUri,
  missingLabel,
  signatureLabel,
}: SignatureCardProps) => {
  const { theme } = useUnistyles();

  return (
    <SquircleView
      borderRadius={22}
      cornerSmoothing={80}
      preserveSmoothing
      style={[styles.card, { backgroundColor: theme.colors.backgroundSecondary }]}
    >
      <Text style={[styles.quoteText, { color: theme.colors.text }]}>{quote}</Text>
      <View style={styles.signatureBlock}
      >
        <Text style={[styles.signatureLabel, { color: theme.colors.textTertiary }]}>
          {signatureLabel}
        </Text>
        <View style={[styles.signatureBox, { borderColor: theme.colors.border }]}
        >
          {signatureUri ? (
            <Image source={{ uri: signatureUri }} style={styles.signatureImage} resizeMode="contain" />
          ) : (
            <Text style={[styles.signaturePlaceholder, { color: theme.colors.textTertiary }]}>
              {missingLabel}
            </Text>
          )}
        </View>
      </View>
    </SquircleView>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: 20,
    gap: 20,
  },
  quoteText: {
    fontFamily: theme.fonts.primary,
    fontSize: 20,
    lineHeight: 26,
    textAlign: "center",
  },
  signatureBlock: {
    gap: 10,
    alignItems: "center",
  },
  signatureLabel: {
    fontFamily: theme.fonts.primary,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  signatureBox: {
    width: "100%",
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  signatureImage: {
    width: "100%",
    height: 90,
  },
  signaturePlaceholder: {
    fontFamily: theme.fonts.primary,
    fontSize: 14,
    textAlign: "center",
  },
}));
