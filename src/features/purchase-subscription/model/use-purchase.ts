import { useCallback } from "react";

import { useSubscription } from "@/entities/subscription";

/**
 * @description Wrapper for purchasing first available package
 */
export const usePurchase = () => {
  const { getPackages, purchasePackage, isLoading, error } = useSubscription();

  const buyFirstAvailable = useCallback(async () => {
    const packages = await getPackages();
    if (!packages.length) throw new Error("No packages available");
    return purchasePackage(packages[0]);
  }, [getPackages, purchasePackage]);

  return {
    buyFirstAvailable,
    isLoading,
    error,
  };
};
