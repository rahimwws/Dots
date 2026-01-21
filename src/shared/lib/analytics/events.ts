// Analytics Event Names - Onboarding Funnel
export const AnalyticsEvents = {
  // Onboarding Flow
  ONBOARDING_STARTED: "onboarding_started",
  AUTH_COMPLETED: "auth_completed",
  NAME_ENTERED: "name_entered",
  QUESTIONS_COMPLETED: "questions_completed",
  TASKS_SELECTED: "tasks_selected",
  MOOD_SELECTED: "mood_selected",
  SIGNATURE_CREATED: "signature_created",

  // Paywall & Purchase
  PAYWALL_VIEWED: "paywall_viewed",
  PURCHASE_STARTED: "purchase_started",
  PURCHASE_COMPLETED: "purchase_completed",
  PURCHASE_CANCELLED: "purchase_cancelled",
  PURCHASE_FAILED: "purchase_failed",
  PURCHASE_RESTORED: "purchase_restored",

  // Completion
  ONBOARDING_COMPLETED: "onboarding_completed",
} as const;

// Event Property Types
export interface AuthCompletedProperties {
  method: "apple";
}

export interface NameEnteredProperties {
  name_length: number;
}

export interface QuestionsCompletedProperties {
  answers: string[];
}

export interface TasksSelectedProperties {
  count: number;
  task_names: string[];
}

export interface MoodSelectedProperties {
  mood: string;
}

export interface PurchaseStartedProperties {
  product_id: string;
  price: number;
}

export interface PurchaseCompletedProperties {
  product_id: string;
  price: number;
}

export interface PurchaseFailedProperties {
  error: string;
  product_id?: string;
}

export interface PurchaseRestoredProperties {
  has_active_subscription: boolean;
}
