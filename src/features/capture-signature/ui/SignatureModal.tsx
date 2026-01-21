import React, { useRef, useState } from "react";
import { Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import SignatureCanvas from "react-native-signature-canvas";
import { Ionicons } from "@expo/vector-icons";

interface SignatureModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  initialSignature?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * @description Modal with signature canvas. Saves PNG data URL.
 */
export const SignatureModal: React.FC<SignatureModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSignature,
}) => {
  const { theme } = useUnistyles();
  const signatureRef = useRef<SignatureCanvas>(null);
  const [hasSignature, setHasSignature] = useState(Boolean(initialSignature));

  const handleSave = (data: string) => {
    if (!data) return;
    onSave(data);
    setHasSignature(true);
    onClose();
  };

  const canvasStyle = `
    body,html{margin:0;padding:0;width:100%;height:100%;background:#FFFFFF;}
    .m-signature-pad {position:absolute;width:100%;height:100%;background:#FFFFFF;}
    .m-signature-pad--body, .m-signature-pad--footer{display:none;}
    canvas{width:100%;height:100%;background:#FFFFFF;}
  `;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles(theme).overlay}>
        <View style={styles(theme).modal}>
          <View style={styles(theme).header}>
            <TouchableOpacity
              style={styles(theme).iconButton}
              onPress={() => signatureRef.current?.undo()}
              disabled={!hasSignature}
            >
              <Ionicons
                name="arrow-undo"
                size={22}
                color={hasSignature ? theme.colors.textSecondary : theme.colors.textTertiary}
              />
            </TouchableOpacity>
            <Text style={styles(theme).title}>Sign</Text>
            <TouchableOpacity style={styles(theme).iconButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles(theme).canvas}>
            <SignatureCanvas
              ref={signatureRef}
              onOK={handleSave}
              onEnd={() => setHasSignature(true)}
              descriptionText=""
              clearText=""
              confirmText=""
              autoClear={false}
              imageType="image/png"
              penColor="#000000"
              backgroundColor="#FFFFFF"
              webStyle={canvasStyle}
            />
          </View>

          <View style={styles(theme).footer}>
            <TouchableOpacity
              style={[
                styles(theme).saveButton,
                !hasSignature && styles(theme).saveButtonDisabled,
              ]}
              onPress={() => signatureRef.current?.readSignature()}
              disabled={!hasSignature}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={hasSignature ? theme.colors.text : theme.colors.icon}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles(theme).saveText,
                  !hasSignature && styles(theme).saveTextDisabled,
                ]}
              >
                Finish signing
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.25)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      width: SCREEN_WIDTH * 0.9,
      maxWidth: 500,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundQuaternary,
    },
    iconButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: theme.fonts.primary,
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    canvas: {
      height: 300,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      marginHorizontal: 16,
      marginVertical: 16,
      overflow: "hidden",
    },
    footer: {
      padding: 16,
      alignItems: "center",
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 10,
      backgroundColor: theme.colors.backgroundSecondary,
      minWidth: 200,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.backgroundTertiary,
    },
    saveText: {
      fontFamily: theme.fonts.primary,
      fontSize: 15,
      color: theme.colors.text,
    },
    saveTextDisabled: {
      color: theme.colors.textTertiary,
    },
  });
