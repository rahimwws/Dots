import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon
          sf="app.background.dotted"
          drawable="custom_android_drawable"
          selectedColor="#2E89FF"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights">
        <Icon
          sf="lasso.badge.sparkles"
          drawable="custom_insights_drawable"
          selectedColor="#2E89FF"
        />
        <Label>Insights</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="add" role="search">
        <Icon
          sf="plus.circle.fill"
          drawable="custom_add_drawable"
          selectedColor="#2E89FF"
        />
        <Label>Search</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
