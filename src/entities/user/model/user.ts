/**
 * @description User entity types
 */

export interface UserContextValue {
  name: string | null;
  isLoading: boolean;
  setName: (name: string) => Promise<void>;
}

export interface OnboardingContextValue {
  hasCompletedOnboarding: boolean | null;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  refreshOnboarding: () => Promise<void>;
}
