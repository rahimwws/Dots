/**
 * @description Subscription entity types
 */

import type {
  PurchasesPackage,
  CustomerInfo as RCCustomerInfo,
  PurchasesOfferings,
} from "react-native-purchases";

export interface SubscriptionStatus {
  isProUser: boolean;
  isPremium: boolean;
  expirationDate: string | null;
  willRenew: boolean;
  productIdentifier: string | null;
}

export interface CustomerInfo {
  originalAppUserId: string;
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  latestExpirationDate: Date | null;
  subscriptionStatus: SubscriptionStatus;
}

export interface SubscriptionContextValue {
  customerInfo: CustomerInfo | null;
  isProUser: boolean;
  isLoading: boolean;
  error: string | null;
  offerings: PurchasesOfferings | null;
  packages: PurchasesPackage[];
  refreshCustomerInfo: () => Promise<void>;
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<{
    customerInfo: RCCustomerInfo;
    productIdentifier: string;
  }>;
  restorePurchases: () => Promise<RCCustomerInfo>;
  getPackages: () => Promise<PurchasesPackage[]>;
  fetchOfferings: () => Promise<PurchasesOfferings | undefined>;
}

export interface SubscriptionInfo {
  isProUser: boolean;
  expirationDate: string | null;
  willRenew: boolean;
  productIdentifier: string | null;
  isYearly: boolean;
  isMonthly: boolean;
}
