import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo as RCCustomerInfo,
  type PurchasesPackage,
  type PurchasesOfferings,
} from "react-native-purchases";
import { Alert } from "react-native";

import { REVENUE_CAT_API_KEY, PRO_ENTITLEMENT_ID } from "@/shared/config";
import type { SubscriptionContextValue, CustomerInfo, SubscriptionStatus } from "./subscription";

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

/** Parse RevenueCat CustomerInfo to our format */
const parseCustomerInfo = (info: RCCustomerInfo): CustomerInfo => {
  const entitlement = info.entitlements.active[PRO_ENTITLEMENT_ID];
  const isProUser = entitlement !== undefined;

  const subscriptionStatus: SubscriptionStatus = {
    isProUser,
    isPremium: isProUser,
    expirationDate: entitlement?.expirationDate ?? null,
    willRenew: entitlement?.willRenew ?? false,
    productIdentifier: entitlement?.productIdentifier ?? null,
  };

  return {
    originalAppUserId: info.originalAppUserId,
    activeSubscriptions: Object.keys(info.entitlements.active),
    allPurchasedProductIdentifiers: info.allPurchasedProductIdentifiers,
    latestExpirationDate: info.latestExpirationDate ? new Date(info.latestExpirationDate) : null,
    subscriptionStatus,
  };
};

/**
 * @description Provider component for subscription state management
 */
export const SubscriptionProvider = ({ children }: SubscriptionProviderProps) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

  const updateCustomerInfo = useCallback((info: RCCustomerInfo) => {
    setCustomerInfo(parseCustomerInfo(info));
    setError(null);
  }, []);

  const fetchOfferings = useCallback(async () => {
    try {
      const result = await Purchases.getOfferings();
      setOfferings(result);
      if (result.current?.availablePackages) {
        setPackages(result.current.availablePackages);
      }
      return result;
    } catch (err) {
      console.error("Error fetching offerings:", err);
      throw err;
    }
  }, []);

  // Initialize RevenueCat
  useEffect(() => {
    const init = async () => {
      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        await Purchases.configure({ apiKey: REVENUE_CAT_API_KEY });

        Purchases.addCustomerInfoUpdateListener((info) => {
          updateCustomerInfo(info);
        });

        const info = await Purchases.getCustomerInfo();
        updateCustomerInfo(info);
        await fetchOfferings();
        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing RevenueCat:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize");
        setIsLoading(false);
      }
    };

    init();
  }, [updateCustomerInfo, fetchOfferings]);

  const refreshCustomerInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const info = await Purchases.getCustomerInfo();
      updateCustomerInfo(info);
    } catch (err) {
      console.error("Error refreshing customer info:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateCustomerInfo]);

  const purchasePackage = useCallback(
    async (packageToPurchase: PurchasesPackage) => {
      try {
        setIsLoading(true);
        setError(null);

        const { customerInfo: info, productIdentifier } =
          await Purchases.purchasePackage(packageToPurchase);

        updateCustomerInfo(info);
        Alert.alert("Purchase Successful", "Thank you for subscribing to 3 Dots Pro!");

        return { customerInfo: info, productIdentifier };
      } catch (err: unknown) {
        console.error("Error purchasing package:", err);

        if ((err as { userCancelled?: boolean }).userCancelled) {
          return Promise.reject({ userCancelled: true });
        }

        const errorMessage = err instanceof Error ? err.message : "Purchase failed";
        setError(errorMessage);
        Alert.alert("Purchase Failed", errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateCustomerInfo]
  );

  const restorePurchases = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const info = await Purchases.restorePurchases();
      updateCustomerInfo(info);

      const hasActive = Object.keys(info.entitlements.active).length > 0;
      Alert.alert(
        hasActive ? "Restore Successful" : "No Purchases Found",
        hasActive ? "Your purchases have been restored!" : "No previous purchases found."
      );

      return info;
    } catch (err) {
      console.error("Error restoring purchases:", err);
      const errorMessage = err instanceof Error ? err.message : "Restore failed";
      setError(errorMessage);
      Alert.alert("Restore Failed", errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateCustomerInfo]);

  const getPackages = useCallback(async (): Promise<PurchasesPackage[]> => {
    if (packages.length > 0) return packages;
    const result = await fetchOfferings();
    return result?.current?.availablePackages ?? [];
  }, [packages, fetchOfferings]);

  const value: SubscriptionContextValue = {
    customerInfo,
    isProUser: customerInfo?.subscriptionStatus.isProUser ?? false,
    isLoading,
    error,
    offerings,
    packages,
    refreshCustomerInfo,
    purchasePackage,
    restorePurchases,
    getPackages,
    fetchOfferings,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

/**
 * @description Hook to access subscription context
 * @throws Error if used outside SubscriptionProvider
 */
export const useSubscription = (): SubscriptionContextValue => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
};

/**
 * @description Hook to check if user has pro access
 */
export const useProAccess = (): boolean => {
  const { isProUser } = useSubscription();
  return isProUser;
};

/**
 * @description Hook for subscription information
 */
export const useSubscriptionInfo = () => {
  const { customerInfo } = useSubscription();

  if (!customerInfo) return null;

  return {
    isProUser: customerInfo.subscriptionStatus.isProUser,
    expirationDate: customerInfo.subscriptionStatus.expirationDate,
    willRenew: customerInfo.subscriptionStatus.willRenew,
    productIdentifier: customerInfo.subscriptionStatus.productIdentifier,
    isYearly: customerInfo.subscriptionStatus.productIdentifier?.includes("yearly") ?? false,
    isMonthly: customerInfo.subscriptionStatus.productIdentifier?.includes("monthly") ?? false,
  };
};
