import React, { useRef, useState } from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
} from "react-native";
import SignatureCanvas from "react-native-signature-canvas";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SignatureModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  initialSignature?: string; // Для информации, не используется в canvas
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSignature,
}) => {
  const signatureRef = useRef<any>(null);
  const [hasSignature, setHasSignature] = useState(!!initialSignature);

  const handleOK = (signature: string) => {
    if (signature) {
      onSave(signature);
      setHasSignature(true);
      onClose();
    }
  };

  const handleUndo = () => {
    signatureRef.current?.undo();
  };

  const handleEnd = () => {
    setHasSignature(true);
  };

  const style = `
    body,html {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: transparent;
    }
    .m-signature-pad {
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: transparent;
    }
    .m-signature-pad--body {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      border: none;
      background-color: transparent;
    }
    .m-signature-pad--body canvas {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      border-radius: 0;
      background-color: transparent;
    }
    .m-signature-pad--footer {
      display: none !important;
    }
    button {
      display: none !important;
    }
    .button {
      display: none !important;
    }
    .m-signature-pad--footer button {
      display: none !important;
    }
  `;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleUndo}
              style={styles.iconButton}
              disabled={!hasSignature}
            >
              <Ionicons
                name="arrow-undo"
                size={24}
                color={hasSignature ? "#666" : "#ccc"}
              />
            </TouchableOpacity>
            <Text style={styles.title}>Sign</Text>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Signature Canvas */}
          <View style={styles.signatureContainer}>
            <SignatureCanvas
              ref={signatureRef}
              onOK={handleOK}
              onEnd={handleEnd}
              descriptionText=""
              clearText=""
              confirmText=""
              webStyle={style}
              autoClear={false}
              imageType="image/png"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.finishButton,
                !hasSignature && styles.finishButtonDisabled,
              ]}
              onPress={() => {
                signatureRef.current?.readSignature();
              }}
              disabled={!hasSignature}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={hasSignature ? "#333" : "#999"}
                style={styles.penIcon}
              />
              <Text
                style={[
                  styles.finishButtonText,
                  !hasSignature && styles.finishButtonTextDisabled,
                ]}
              >
                Finish Signing
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  signatureContainer: {
    alignSelf: "stretch",
    height: 300,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 16,
    overflow: "hidden",
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 200,
  },
  finishButtonDisabled: {
    backgroundColor: "#f9f9f9",
  },
  penIcon: {
    marginRight: 8,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  finishButtonTextDisabled: {
    color: "#999",
  },
});
