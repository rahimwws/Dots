import { useCallback, useEffect, useState } from "react";

import { storage } from "@/shared/lib/storage";
import { STORAGE_KEYS } from "@/shared/config";

/**
 * @description Manage signature data in AsyncStorage
 */
export const useSignature = () => {
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSignature = useCallback(async () => {
    try {
      const stored = await storage.getString(STORAGE_KEYS.SIGNATURE);
      setSignature(stored);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSignature();
  }, [loadSignature]);

  const saveSignature = useCallback(
    async (data: string) => {
      await storage.setString(STORAGE_KEYS.SIGNATURE, data);
      setSignature(data);
    },
    []
  );

  const clearSignature = useCallback(async () => {
    await storage.remove(STORAGE_KEYS.SIGNATURE);
    setSignature(null);
  }, []);

  return {
    signature,
    isLoading,
    saveSignature,
    clearSignature,
    loadSignature,
  };
};
