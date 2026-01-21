import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * @description Type-safe AsyncStorage wrapper
 */
export const storage = {
  /**
   * Get string value from storage
   */
  async getString(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get ${key} from storage:`, error);
      return null;
    }
  },

  /**
   * Set string value in storage
   */
  async setString(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to set ${key} in storage:`, error);
    }
  },

  /**
   * Get JSON object from storage
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to get ${key} from storage:`, error);
      return null;
    }
  },

  /**
   * Set JSON object in storage
   */
  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set ${key} in storage:`, error);
    }
  },

  /**
   * Remove value from storage
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from storage:`, error);
    }
  },

  /**
   * Check if key exists in storage
   */
  async has(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Failed to check ${key} in storage:`, error);
      return false;
    }
  },
};
