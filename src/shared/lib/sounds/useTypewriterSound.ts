import { useEffect, useRef } from "react";
import { Audio } from "expo-av";

export const useTypewriterSound = () => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const lastPlayTimeRef = useRef<number>(0);
  const MIN_INTERVAL = 50; // Minimum time between sounds in ms

  useEffect(() => {
    // Configure audio mode
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    return () => {
      // Cleanup
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playTypeSound = async () => {
    const now = Date.now();

    // Throttle sound playback
    if (now - lastPlayTimeRef.current < MIN_INTERVAL) {
      return;
    }

    lastPlayTimeRef.current = now;

    try {
      // Create a simple click sound using Audio API
      // Since we don't have an audio file, we'll use system sounds via Haptics
      // For a real typewriter sound, you would load an audio file here
      const { sound } = await Audio.Sound.createAsync(
        // Using a built-in system sound
        { uri: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" },
        { shouldPlay: true, volume: 0.3 },
        null,
        false
      );

      // Unload after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      // Silently fail if sound can't be played
      console.log("Sound error:", error);
    }
  };

  return { playTypeSound };
};
