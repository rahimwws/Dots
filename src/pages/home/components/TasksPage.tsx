import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import { GlassView } from "expo-glass-effect";
import { SignatureDisplay, useSignatureStorage } from "@/shared/ui/Signature";
import { SelectableText } from "@/shared/ui/SelectableText";
import { MoodBottomSheet } from "@/shared/ui/MoodBottomSheet";

type TasksPageProps = {
  width: number;
  pageHeight: number;
  bottomInset: number;
};

export const TasksPage = ({
  width,
  pageHeight,
  bottomInset,
}: TasksPageProps) => {
  const { signature } = useSignatureStorage();
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const handleCaptureMood = () => {
    setIsBottomSheetVisible(true);
  };

  const handleCloseBottomSheet = (isOpened: boolean) => {
    setIsBottomSheetVisible(isOpened);
  };

  const handleContinue = (selectedTriggers: string[]) => {
    console.log("Selected triggers:", selectedTriggers);
    setIsBottomSheetVisible(false);
    // Здесь можно добавить логику для обработки выбранных триггеров
  };

  return (
    <View
      style={{
        width,
        height: pageHeight,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingTop: 90,
        paddingBottom: bottomInset + 30,
      }}
    >
      <View style={{ flex: 1 }}>
        <SelectableText
          text="The magic you've been looking for is in the work you're avoiding."
          style={{
            fontFamily: "is-r",
            fontSize: 32,
            textAlign: "center",
            color: "#000",
            marginBottom: 22,
          }}
          onRegenerate={() => {
            console.log("Quote regenerated!");
          }}
        />
        <SignatureDisplay signature={signature} width={250} height={150} />
        <Image
          source={require("@/shared/assets/images/arrow.png")}
          style={{
            width: 300,
            height: 300,
            position: "absolute",
            bottom: 60,
            left: -220,
            transform: [{ rotate: "-10deg" }],
          }}
          resizeMode="contain"
        />
        <Text
          style={{
            fontFamily: "is-r",
            fontSize: 22,
            color: "#000",
            textAlign: "right",
            marginTop: 80,
            marginLeft: 100,
          }}
        >
          Just notice how today feels
        </Text>
      </View>

      <GlassView
        style={{
          width: "90%",
          borderRadius: 100,
          backgroundColor: "#000",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 24,
          marginTop: 22,
        }}
        isInteractive
        glassEffectStyle="clear"
        onTouchStart={handleCaptureMood}
      >
        <Text style={{ fontFamily: "is-r", fontSize: 22, color: "#fff" }}>
          Capture your mood
        </Text>
      </GlassView>

      <MoodBottomSheet
        visible={isBottomSheetVisible}
        onClose={handleCloseBottomSheet}
        onContinue={handleContinue}
      />
    </View>
  );
};
