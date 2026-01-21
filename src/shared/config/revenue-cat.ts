/**
 * @description RevenueCat SDK configuration constants
 */

/** API Key for RevenueCat */
export const REVENUE_CAT_API_KEY = "appl_ODcOrOaLEIHGtfYohczrdySdkJz";

/** Entitlement identifier for Pro features */
export const PRO_ENTITLEMENT_ID = "3 Dots Pro";

/** Product identifiers */
export const PRODUCT_IDS = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

/** Default offering identifier */
export const DEFAULT_OFFERING_ID = "default";

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];
