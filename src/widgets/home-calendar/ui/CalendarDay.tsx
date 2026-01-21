import React from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { SquircleView } from "expo-squircle-view";

import type { DayCell } from "../model/use-calendar-data";
import { DayCompleted } from "@/shared/assets";

interface CalendarDayProps {
    cell: DayCell;
    todayKey: string;
    selectedDate?: string;
    progressRatio: number;
    fillColor?: string;
    onPress?: (dateKey: string) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
    cell,
    todayKey,
    selectedDate,
    progressRatio,
    fillColor,
    onPress,
}) => {
    const { theme } = useUnistyles();
    const isToday = cell.key === todayKey;
    const isSelected = selectedDate === cell.key;
    const clampedRatio = Math.max(0, Math.min(1, progressRatio));
    const textOnFill = clampedRatio >= 0.5;
    const isFilledDay = clampedRatio > 0;
    const isCompletedDay = clampedRatio >= 1;

    return (
        <SquircleView key={cell.key} style={styles.daySlot}>
            <Pressable onPress={() => onPress?.(cell.key)} disabled={!cell.inMonth}>
                <SquircleView style={styles.day} cornerSmoothing={100} borderRadius={999}>
                    <View
                        style={[
                            styles.dayInner,
                            cell.inMonth ? styles.dayInMonth : styles.dayOutMonth,
                            isSelected && styles.daySelected,
                        ]}
                    >
                        {!isCompletedDay ? (
                            <View
                                pointerEvents="none"
                                style={[
                                    styles.borderOverlay,
                                    isFilledDay ? styles.borderFilled : styles.borderEmpty,
                                    isToday && styles.borderToday,
                                ]}
                            />
                        ) : null}
                        {!isCompletedDay && clampedRatio > 0 ? (
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${clampedRatio * 100}%`, backgroundColor: fillColor },
                                ]}
                            />
                        ) : null}

                        {isCompletedDay ? (
                            <View pointerEvents="none" style={styles.completedIcon}>
                                <DayCompleted
                                    size={26}
                                    color={theme.colors.calendarCheck}
                                    checkColor={theme.colors.calendarCheck}
                                />
                            </View>
                        ) : (
                            <Text
                                style={[
                                    styles.dayLabel,
                                    isToday && styles.dayLabelToday,
                                    textOnFill && styles.dayLabelOnFill,
                                ]}
                            >
                                {cell.label}
                            </Text>
                        )}
                    </View>
                </SquircleView>
            </Pressable>
        </SquircleView>
    );
};

const styles = StyleSheet.create((theme) => ({
    daySlot: {
        width: "14.28%",
        padding: 4,
    },
    day: {
        padding: 2,
        borderRadius: 12,
    },
    dayInner: {
        width: "100%",
        aspectRatio: 1,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
    },
    dayInMonth: {
        backgroundColor: theme.colors.backgroundSecondary,
    },
    dayOutMonth: {
        backgroundColor: theme.colors.backgroundQuaternary,
        opacity: 0.6,
    },
    daySelected: {
        borderWidth: 1.5,
        borderColor: theme.colors.text,
    },
    dayLabel: {
        fontFamily: theme.fonts.primary,
        fontSize: 14,
        color: theme.colors.text,
    },
    dayLabelToday: {
        fontWeight: "800",
    },
    dayLabelOnFill: {
        color: theme.colors.background,
    },
    borderOverlay: {
        position: "absolute",
        inset: 0,
    },
    borderFilled: {
        borderWidth: 1,
        borderColor: theme.colors.background,
        borderRadius: 12,
    },
    borderEmpty: {},
    borderToday: {
        borderWidth: 1.5,
        borderColor: theme.colors.calendarCheck,
        borderRadius: 12,
    },
    progressFill: {
        position: "absolute",
        left: 0,
        bottom: 0,
        top: 0,
    },
    completedIcon: {
        position: "absolute",
        inset: 0,
        alignItems: "center",
        justifyContent: "center",
    },
}));
