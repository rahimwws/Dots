import type { PaywallFeature } from "@/widgets/paywall-content";

export const PAYWALL_COPY = {
  overline: "JUST DO IT",
  title: "3-day free trial",
  signatureLabel: "Your signature",
  signatureMissing: "Signature missing",
  finePrint:
    "Cancel anytime before the trial ends. Subscription automatically renews unless canceled at least 24 hours before renewal.",
  quote: "The magic you've been looking for is in the work you're avoiding.",
} as const;

export const FEATURE_ITEMS: PaywallFeature[] = [
  {
    title: "Auto-Reschedule",
    description: "Overdue tasks slide to your next energy peak — so nothing slips.",
    icon: "sparkles",
    comingSoon: true,
  },
  {
    title: "Plan My Day",
    description:
      "Let AI plan your day for you. Adjusted for how you feel and the tasks in your list.",
    icon: "clipboard-list",
    comingSoon: true,
  },
  {
    title: "Focus Windows",
    description: "Protect your deep work with smart, quiet time blocks.",
    icon: "timer",
    comingSoon: true,
  },
];
