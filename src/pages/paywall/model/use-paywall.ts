import { useEffect, useMemo, useState } from "react";
import type { PurchasesPackage } from "react-native-purchases";

import { useSubscription } from "@/entities/subscription";
import { useSignature } from "@/features/capture-signature";

interface UsePaywallOptions {
  onComplete: () => void;
}

/**
 * @description Paywall purchase flow and pricing state
 */
export const usePaywall = ({ onComplete }: UsePaywallOptions) => {
  const { signature } = useSignature();
  const { packages, isLoading, getPackages, purchasePackage, restorePurchases } =
    useSubscription();
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (packages.length === 0) {
      getPackages().catch((err) => {
        console.error("Failed to load packages:", err);
      });
    }
  }, [packages.length, getPackages]);

  const monthlyPackage = useMemo<PurchasesPackage | null>(() => {
    const monthly = packages.find((pkg) => pkg.product.identifier.includes("monthly"));
    return monthly || packages[0] || null;
  }, [packages]);

  const priceString = monthlyPackage?.product.priceString ?? "$34";

  const handlePurchase = async () => {
    if (!monthlyPackage) {
      return;
    }

    try {
      setIsPurchasing(true);
      await purchasePackage(monthlyPackage);
      onComplete();
    } catch (error: unknown) {
      if (!(error as { userCancelled?: boolean })?.userCancelled) {
        console.error("Purchase failed:", error);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsPurchasing(true);
      await restorePurchases();
      onComplete();
    } catch (error) {
      console.error("Restore failed:", error);
    } finally {
      setIsPurchasing(false);
    }
  };

  return {
    signature,
    monthlyPackage,
    priceString,
    isLoading,
    isPurchasing,
    isBusy: isPurchasing || (isLoading && packages.length === 0),
    hasPackages: packages.length > 0,
    handlePurchase,
    handleRestore,
  };
};
