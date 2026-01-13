import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SIGNATURE_STORAGE_KEY = "@user_signature";

export const useSignatureStorage = () => {
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSignature();
  }, []);

  const loadSignature = async () => {
    try {
      const stored = await AsyncStorage.getItem(SIGNATURE_STORAGE_KEY);
      setSignature(stored);
    } catch (error) {
      console.error("Error loading signature:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSignature = async (signatureData: string) => {
    try {
      await AsyncStorage.setItem(SIGNATURE_STORAGE_KEY, signatureData);
      setSignature(signatureData);
      return true;
    } catch (error) {
      console.error("Error saving signature:", error);
      return false;
    }
  };

  const clearSignature = async () => {
    try {
      await AsyncStorage.removeItem(SIGNATURE_STORAGE_KEY);
      setSignature(null);
      return true;
    } catch (error) {
      console.error("Error clearing signature:", error);
      return false;
    }
  };

  return {
    signature,
    loading,
    saveSignature,
    clearSignature,
    loadSignature,
  };
};


