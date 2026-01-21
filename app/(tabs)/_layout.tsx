import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { useUnistyles } from "react-native-unistyles";

export default function TabLayout() {
  const { theme } = useUnistyles();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>

        <Icon
          sf="app.background.dotted"
          drawable="custom_android_drawable"
          selectedColor={theme.colors.accent}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights">
        <Icon
          sf="lasso.badge.sparkles"
          drawable="custom_insights_drawable"
          selectedColor={theme.colors.accent}
        />
        <Label>Insights</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="add" role="search">
        <Icon
          sf="plus.circle.fill"
          drawable="custom_add_drawable"
          selectedColor={theme.colors.accent}
        />
        <Label>Search</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
