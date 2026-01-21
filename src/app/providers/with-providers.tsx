import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { TasksProvider } from "@/entities/task";
import { MoodProvider } from "@/entities/mood";
import { StreakProvider } from "@/entities/streak";
import { OnboardingProvider } from "@/entities/user";
import { SubscriptionProvider } from "@/entities/subscription";
import { NotificationProvider } from "@/shared/lib/notifications";

interface WithProvidersProps {
  children: React.ReactNode;
}

/**
 * @description Composition of app-level providers
 */
export const WithProviders = ({ children }: WithProvidersProps) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SubscriptionProvider>
        <OnboardingProvider>
          <MoodProvider>
            <StreakProvider>
              <TasksProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </TasksProvider>
            </StreakProvider>
          </MoodProvider>
        </OnboardingProvider>
      </SubscriptionProvider>
    </GestureHandlerRootView>
  );
};
