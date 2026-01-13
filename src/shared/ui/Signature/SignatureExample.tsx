import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SignatureModal, SignatureDisplay, useSignatureStorage } from "./index";

/**
 * Пример использования компонента подписи
 *
 * Использование:
 * ```tsx
 * import { SignatureExample } from '@/shared/ui/Signature/SignatureExample';
 *
 * <SignatureExample />
 * ```
 */
export const SignatureExample: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { signature, saveSignature, clearSignature } = useSignatureStorage();

  const handleSave = (signatureData: string) => {
    saveSignature(signatureData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Подпись</Text>

      <SignatureDisplay
        signature={signature}
        onPress={() => setModalVisible(true)}
        width={300}
        height={150}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>
            {signature ? "Изменить подпись" : "Создать подпись"}
          </Text>
        </TouchableOpacity>

        {signature && (
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearSignature}
          >
            <Text style={[styles.buttonText, styles.clearButtonText]}>
              Удалить подпись
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <SignatureModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        initialSignature={signature || undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 30,
    gap: 12,
  },
  button: {
    backgroundColor: "#2E89FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  clearButton: {
    backgroundColor: "#f5f5f5",
  },
  clearButtonText: {
    color: "#ff4444",
  },
});
