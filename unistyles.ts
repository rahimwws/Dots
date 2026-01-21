import { StyleSheet } from "react-native-unistyles";

// Define light theme
export const lightTheme = {
  colors: {
    // Background colors
    background: "#FFFFFF",
    backgroundSecondary: "#F8F8F8",
    backgroundTertiary: "#FAFAFA",
    backgroundQuaternary: "#F0F0F0",
    backgroundSuccessSoft: "#d8f3e2",
    // Text colors
    text: "#1F1F1F",
    textSecondary: "#7A7A7A",
    textTertiary: "#A0A0A0",
    textQuaternary: "#9D9D9D",
    textHint: "#9B9B9B",
    textInverse: "#FFFFFF",
    textSuccess: "#2e9b6d",
    // Border colors
    border: "#E6E6E6",
    borderDashed: "#CFCFCF",

    // Accent colors
    accent: "#2E89FF",
    accentText: "#2E89FF",

    // Calendar specific
    calendarCheck: "#171717",
    calendarEmpty: "#CFCFCF",

    // Button colors
    buttonPrimary: "#1E1E1E",
    buttonPrimaryText: "#FFFFFF",
    buttonSecondary: "#F8F8F8",
    buttonSecondaryText: "#1F1F1F",

    // Icon colors
    icon: "#999999",
    iconSecondary: "#A0A0A0",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 100,
  },
  fonts: {
    primary: "is-r",
  },
} as const;

// Define dark theme
export const darkTheme = {
  colors: {
    // Background colors
    background: "#1E1E1E",
    backgroundSecondary: "#1A1A1A",
    backgroundTertiary: "#0F0F0F",
    backgroundQuaternary: "#262626",
    textSuccess: "#2e9b6d",
    backgroundSuccessSoft: "#d8f3e2",

    // Text colors
    text: "#FFFFFF",
    textSecondary: "#B0B0B0",
    textTertiary: "#808080",
    textQuaternary: "#6B6B6B",
    textHint: "#707070",
    textInverse: "#1E1E1E",

    // Border colors
    border: "#2A2A2A",
    borderDashed: "#404040",

    // Accent colors
    accent: "#2E89FF",
    accentText: "#2E89FF",

    // Calendar specific
    calendarCheck: "#FFFFFF",
    calendarEmpty: "#404040",

    // Button colors
    buttonPrimary: "#FFFFFF",
    buttonPrimaryText: "#1E1E1E",
    buttonSecondary: "#1A1A1A",
    buttonSecondaryText: "#FFFFFF",

    // Icon colors
    icon: "#808080",
    iconSecondary: "#707070",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 100,
  },
  fonts: {
    primary: "is-r",
  },
} as const;
const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};
// Define breakpoints
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

type AppBreakpoints = typeof breakpoints;
type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    adaptiveThemes: true,
  },
  breakpoints,
  themes: appThemes,
});
