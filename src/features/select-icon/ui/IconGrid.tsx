import React from "react";
import { TouchableOpacity, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Lucide } from "@react-native-vector-icons/lucide";

interface IconGridProps {
  icons: string[];
  selectedIcon?: string;
  onSelect: (icon: string) => void;
}

/**
 * @description Grid of Lucide icons with selection state
 */
export const IconGrid: React.FC<IconGridProps> = ({ icons, selectedIcon, onSelect }) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.grid}>
      {icons.map((iconName) => {
        const isSelected = selectedIcon === iconName;
        return (
          <TouchableOpacity
            key={iconName}
            style={[
              styles.iconButton,
              {
                borderColor: isSelected ? theme.colors.text : theme.colors.border,
                backgroundColor: isSelected ? theme.colors.backgroundTertiary : "transparent",
              },
            ]}
            onPress={() => onSelect(iconName)}
            activeOpacity={0.7}
          >
            <Lucide
              name={iconName as any}
              size={24}
              color={isSelected ? theme.colors.text : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-start",
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
}));
