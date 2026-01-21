import React, { useEffect, useMemo, useRef } from "react";
import { Text, View } from "react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { StyleSheet } from "react-native-unistyles";

import { MoodGrid } from "./MoodGrid";
import { useMoodSelection } from "../model/use-mood-selection";

interface MoodBottomSheetProps {
  onClose: (open: boolean) => void;
  onContinue: (selected: string[]) => void;
  date?: string;
  sheetRef?: React.RefObject<TrueSheet>;
  /**
   * @description TrueSheet name to allow global present/dismiss
   * @default "mood"
   */
  name?: string;
  /**
   * @description Present on mount (useful for onboarding)
   */
  openOnMount?: boolean;
}

/**
 * @description Bottom sheet for selecting current mood. Saves to DB and returns selection.
 */
export const MoodBottomSheet: React.FC<MoodBottomSheetProps> = ({
  onClose,
  onContinue,
  date,
  sheetRef,
  name = "mood",
  openOnMount = false,
}) => {
  const internalRef = useRef<TrueSheet>(null);
  const ref = useMemo(() => sheetRef ?? internalRef, [sheetRef]);
  const { moods, activeIndex, selectMood } = useMoodSelection(date);

  const handleSelect = async (index: number) => {
    const mood = await selectMood(index);
    onContinue([mood]);
  };

  useEffect(() => {
    if (openOnMount) {
      ref.current?.present();
    }
  }, [openOnMount, ref]);

  return (
    <TrueSheet
      ref={ref}
      dimmed
      name={name}
      detents={[0.4]}
      cornerRadius={32}
      grabber
      backgroundBlur="default"
      blurOptions={{ intensity: 30, interaction: true }}
      onDidDismiss={() => onClose(false)}
      style={styles.sheet}
    >
      <View style={styles.container}>
        <Text style={styles.title}>How are you feeling?</Text>
        <MoodGrid moods={moods} activeIndex={activeIndex} onSelect={handleSelect} />
      </View>
    </TrueSheet>
  );
};

const styles = StyleSheet.create((theme) => ({
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  container: {
    gap: 12,
  },
  title: {
    fontFamily: theme.fonts.primary,
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
  },
}));
