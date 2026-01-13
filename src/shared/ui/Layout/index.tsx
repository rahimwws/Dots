import type React from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LayoutProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  includeTopInset?: boolean;
};

export const Layout = ({
  children,
  scrollable = false,
  includeTopInset = true,
}: LayoutProps) => {
  const { top } = useSafeAreaInsets();
  if (scrollable) {
    return (
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 50, flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: includeTopInset ? top : 0,
      }}
    >
      {children}
    </View>
  );
};
