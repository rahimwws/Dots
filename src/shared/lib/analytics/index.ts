import { customEvent, identifyDevice } from "vexo-analytics";

export { AnalyticsEvents } from "./events";

/**
 * Track an analytics event with optional properties
 * Skips tracking in development mode
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
): void {
  if (__DEV__) {
    console.log("[Analytics] (dev, skipped)", eventName, properties ?? "");
    return;
  }

  try {
    customEvent(eventName, properties ?? {});
  } catch (error) {
    console.error("[Analytics] Failed to track event:", eventName, error);
  }
}

/**
 * Identify a user for analytics tracking
 * Skips identification in development mode
 */
export function identifyUser(userId: string): void {
  if (__DEV__) {
    console.log("[Analytics] (dev, skipped) Identify user:", userId);
    return;
  }

  try {
    identifyDevice(userId);
  } catch (error) {
    console.error("[Analytics] Failed to identify user:", error);
  }
}
