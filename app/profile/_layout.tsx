import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

export default function ProfileLayout() {
  const { theme } = useUnistyles();
  return (
    <Stack screenOptions={{}}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Profile",
          headerTitleStyle: {
            fontFamily: theme.fonts.primary,
            fontSize: 22,
            color: theme.colors.text,
          },
          headerBlurEffect: "regular",
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="paywall"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}
