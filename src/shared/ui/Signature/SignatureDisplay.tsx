import { SquircleView } from "expo-squircle-view";
import React from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";

interface SignatureDisplayProps {
  signature: string | null;
  onPress?: () => void;
  width?: number;
  height?: number;
}

export const SignatureDisplay: React.FC<SignatureDisplayProps> = ({
  signature,
  onPress,
  width = 200,
  height = 100,
}) => {
  if (!signature) {
    return (
      <View style={[styles.container, { width, height }, styles.placeholder]}>
        {onPress && (
          <TouchableOpacity
            style={styles.touchable}
            onPress={onPress}
            activeOpacity={0.7}
          />
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        width,
        height,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderStyle: "dashed",
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 10,
        alignSelf: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "is-r",
          fontSize: 18,
          color: "#000",
          position: "absolute",
          top: 10,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        Signature of commitment
      </Text>
      <Image
        source={{ uri: signature }}
        style={styles.image}
        resizeMode="contain"
      />
      {onPress && (
        <TouchableOpacity
          style={styles.touchable}
          onPress={onPress}
          activeOpacity={0.7}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderStyle: "dashed",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    backgroundColor: "#fafafa",
  },
  touchable: {
    ...StyleSheet.absoluteFillObject,
  },
});
