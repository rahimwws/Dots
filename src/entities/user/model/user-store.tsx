import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

import { storage } from "@/shared/lib/storage";
import { STORAGE_KEYS } from "@/shared/config";
import type { UserContextValue, OnboardingContextValue } from "./user";

// ============ User Name Store ============

/**
 * @description Save user name to storage
 */
export const saveUserName = async (name: string): Promise<void> => {
  await storage.setString(STORAGE_KEYS.USER_NAME, name);
};

/**
 * @description Get user name from storage
 */
export const getUserName = async (): Promise<string | null> => {
  return storage.getString(STORAGE_KEYS.USER_NAME);
};

/**
 * @description Clear user name from storage
 */
export const clearUserName = async (): Promise<void> => {
  await storage.remove(STORAGE_KEYS.USER_NAME);
};

/**
 * @description Hook for user name management
 */
export const useUserName = (): UserContextValue => {
  const [name, setNameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserName().then((storedName) => {
      setNameState(storedName);
      setIsLoading(false);
    });
  }, []);

  const setName = async (newName: string) => {
    await saveUserName(newName);
    setNameState(newName);
  };

  return { name, isLoading, setName };
};

// ============ Onboarding Store ============

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

interface OnboardingProviderProps {
  children: React.ReactNode;
}

/**
 * @description Provider component for onboarding state management
 */
export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshOnboarding = useCallback(async () => {
    try {
      const value = await storage.getString(STORAGE_KEYS.ONBOARDING_COMPLETED);
      setHasCompletedOnboarding(value === "true");
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOnboarding();
  }, [refreshOnboarding]);

  const completeOnboarding = useCallback(async () => {
    try {
      await storage.setString(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error("Failed to save onboarding status:", error);
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await storage.remove(STORAGE_KEYS.ONBOARDING_COMPLETED);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error("Failed to reset onboarding status:", error);
    }
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        isLoading,
        completeOnboarding,
        resetOnboarding,
        refreshOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

/**
 * @description Hook to access onboarding context
 * @throws Error if used outside OnboardingProvider
 */
export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
};
