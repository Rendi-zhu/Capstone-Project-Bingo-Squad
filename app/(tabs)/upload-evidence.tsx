import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "../../services/api";

import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface EvidenceItem {
  id: string;
  name: string;
  sizeLabel: string;
  kind: "image" | "pdf" | "file";
}

function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const mb = bytes / (1024 * 1024);

  if (mb >= 0.1) {
    return `${mb.toFixed(1)}MB`;
  }

  const kb = bytes / 1024;

  return `${kb.toFixed(0)}KB`;
}

export default function UploadEvidence() {
  const params = useLocalSearchParams();

  const reflectionId = Array.isArray(params.reflectionId)
    ? params.reflectionId[0]
    : params.reflectionId;

  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Load evidence from backend
  useEffect(() => {
    const loadEvidence = async () => {
      if (!reflectionId) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/evidence/reflection/${reflectionId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load evidence");
        }

        const data = await response.json();

        const formatted: EvidenceItem[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.file_name,
          sizeLabel: "",
          kind: item.file_type?.includes("image")
            ? "image"
            : item.file_type?.includes("pdf")
              ? "pdf"
              : "file",
        }));

        setEvidence(formatted);
      } catch (error) {
        console.error("Error loading evidence:", error);
      }
    };

    loadEvidence();
  }, [reflectionId]);

  const uploadFile = async (
    uri: string,
    name: string,
    type: string,
    size?: number
  ) => {
    if (!reflectionId) {
      Alert.alert("Error", "Reflection ID is missing.");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();

      formData.append("reflection_id", String(reflectionId));

      formData.append(
        "file",
        {
          uri,
          name,
          type,
        } as any
      );

      const response = await fetch(
        `${API_BASE_URL}/api/evidence/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to upload evidence"
        );
      }

      setEvidence((prev) => [
        {
          id: String(data.evidenceId),
          name: data.file?.name || name,
          sizeLabel: formatBytes(size),
          kind: type.includes("image")
            ? "image"
            : type.includes("pdf")
              ? "pdf"
              : "file",
        },
        ...prev,
      ]);

      Alert.alert(
        "Uploaded",
        "Evidence uploaded successfully."
      );
    } catch (error) {
      console.error("Upload error:", error);

      Alert.alert(
        "Upload Failed",
        "Could not upload this file. Only PDF, JPG and PNG files up to 10MB are allowed."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Pick image
  const handlePickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo access to upload images."
      );

      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];

      await uploadFile(
        asset.uri,
        asset.fileName ?? "Photo.jpg",
        asset.mimeType ?? "image/jpeg",
        asset.fileSize
      );
    }
  };

  // Take photo
  const handleTakePhoto = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow camera access to take a photo."
      );

      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];

      await uploadFile(
        asset.uri,
        asset.fileName ?? "Photo.jpg",
        asset.mimeType ?? "image/jpeg",
        asset.fileSize
      );
    }
  };

  // Pick document
  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];

      await uploadFile(
        asset.uri,
        asset.name,
        asset.mimeType ?? "application/octet-stream",
        asset.size ?? undefined
      );
    }
  };

  // Delete evidence
  const removeEvidence = async (id: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/evidence/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete evidence"
        );
      }

      setEvidence((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error("Delete evidence error:", error);

      Alert.alert(
        "Error",
        "Could not delete the evidence."
      );
    }
  };

  // Link metadata
  const handleOpenLinkModal = () => {
    setLinkValue("");
    setLinkModalVisible(true);
  };

  const handleSaveLink = async () => {
    if (!reflectionId) {
      Alert.alert("Error", "Reflection ID is missing.");
      return;
    }

    if (!linkValue.trim()) {
      setLinkModalVisible(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/evidence`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            reflection_id: Number(reflectionId),
            file_name: linkValue.trim(),
            file_type: "link",
            file_url: linkValue.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save link"
        );
      }

      setEvidence((prev) => [
        {
          id: String(data.evidenceId),
          name: linkValue.trim(),
          sizeLabel: "",
          kind: "file",
        },
        ...prev,
      ]);

      setLinkModalVisible(false);
      setLinkValue("");
    } catch (error) {
      console.error("Save link error:", error);

      Alert.alert(
        "Error",
        "Could not save the link."
      );
    }
  };

  const handleComingSoon = (label: string) => {
    Alert.alert(
      label,
      "This upload option is coming soon."
    );
  };

  const uploadOptions: {
    key: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
  }[] = [
    {
      key: "gallery",
      icon: "image-outline",
      label: "Gallery",
      onPress: handlePickImage,
    },

    {
      key: "link",
      icon: "link-outline",
      label: "Link",
      onPress: handleOpenLinkModal,
    },

    {
      key: "camera",
      icon: "camera-outline",
      label: "Camera",
      onPress: handleTakePhoto,
    },

    {
      key: "cloud",
      icon: "cloud-download-outline",
      label: "Cloud",
      onPress: () =>
        handleComingSoon("Cloud Storage"),
    },

    {
      key: "document",
      icon: "document-text-outline",
      label: "Document",
      onPress: handlePickDocument,
    },
  ];

  const iconFor = (
    kind: EvidenceItem["kind"]
  ) => {
    switch (kind) {
      case "image":
        return "image-outline";

      case "pdf":
        return "document-outline";

      default:
        return "document-attach-outline";
    }
  };

  const handleNext = () => {
    if (!reflectionId) {
      Alert.alert(
        "Error",
        "Reflection ID is missing."
      );

      return;
    }

    router.push({
      pathname: "/(tabs)/self-assessment",

      params: {
        reflectionId: String(reflectionId),
      },
    });
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            Upload Evidence
          </Text>

          <Text style={styles.subtitle}>
            Add supporting evidence for your reflection
          </Text>

          <View style={styles.section}>
            <Text style={styles.label}>
              Upload Evidence
            </Text>

            <View style={styles.uploadBox}>
              <View style={styles.uploadRow}>
                {uploadOptions
                  .slice(0, 3)
                  .map((option) => (
                    <Pressable
                      key={option.key}
                      style={styles.uploadOption}
                      onPress={option.onPress}
                      disabled={isUploading}
                    >
                      <Ionicons
                        name={option.icon}
                        size={30}
                        color="#3F2A88"
                      />
                    </Pressable>
                  ))}
              </View>

              <View
                style={
                  styles.uploadRowCentered
                }
              >
                {uploadOptions
                  .slice(3)
                  .map((option) => (
                    <Pressable
                      key={option.key}
                      style={styles.uploadOption}
                      onPress={option.onPress}
                      disabled={isUploading}
                    >
                      <Ionicons
                        name={option.icon}
                        size={30}
                        color="#3F2A88"
                      />
                    </Pressable>
                  ))}
              </View>
            </View>

            {isUploading && (
              <Text style={styles.uploadingText}>
                Uploading evidence...
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Uploaded Evidence
            </Text>

            {evidence.length === 0 ? (
              <View style={styles.emptyState}>
                <Text
                  style={
                    styles.emptyStateText
                  }
                >
                  No evidence uploaded yet.
                </Text>
              </View>
            ) : (
              <View
                style={styles.evidenceList}
              >
                {evidence.map((item) => (
                  <View
                    key={item.id}
                    style={styles.evidenceRow}
                  >
                    <Ionicons
                      name={iconFor(item.kind)}
                      size={24}
                      color="#3F2A88"
                    />

                    <View
                      style={
                        styles.evidenceInfo
                      }
                    >
                      <Text
                        style={
                          styles.evidenceName
                        }
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>

                      <Text
                        style={
                          styles.evidenceMeta
                        }
                      >
                        {item.kind.toUpperCase()}
                        {item.sizeLabel
                          ? ` · ${item.sizeLabel}`
                          : ""}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() =>
                        removeEvidence(
                          item.id
                        )
                      }
                      hitSlop={10}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#000"
                      />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Pressable
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text
              style={
                styles.nextButtonText
              }
            >
              Next
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFF"
            />
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={linkModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setLinkModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Add Link
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="https://example.com"
              placeholderTextColor="#999"
              value={linkValue}
              onChangeText={setLinkValue}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <View
              style={
                styles.modalButtonRow
              }
            >
              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalCancelButton,
                ]}
                onPress={() =>
                  setLinkModalVisible(
                    false
                  )
                }
              >
                <Text
                  style={
                    styles.modalCancelText
                  }
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalSaveButton,
                ]}
                onPress={handleSaveLink}
              >
                <Text
                  style={
                    styles.modalSaveText
                  }
                >
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  content: {
    width: "90%",
    alignSelf: "center",
    paddingTop: 10,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },

  subtitle: {
    fontSize: 15,
    color: "#555",
    marginTop: 5,
    marginBottom: 25,
  },

  section: {
    marginBottom: 28,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000",
  },

  uploadBox: {
    backgroundColor: "#E4DEFA",
    borderRadius: 16,
    padding: 20,
  },

  uploadOption: {
    width: "26%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  uploadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  uploadRowCentered: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 24,
  },

  uploadingText: {
    marginTop: 10,
    textAlign: "center",
    color: "#555",
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: "center",
  },

  emptyStateText: {
    color: "#888",
    fontSize: 14,
  },

  evidenceList: {
    gap: 10,
  },

  evidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },

  evidenceInfo: {
    flex: 1,
  },

  evidenceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },

  evidenceMeta: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },

  nextButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#3F2A88",
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },

  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 14,
  },

  modalInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    marginBottom: 18,
  },

  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  modalCancelButton: {
    backgroundColor: "#F0F0F0",
  },

  modalSaveButton: {
    backgroundColor: "#3F2A88",
  },

  modalCancelText: {
    color: "#333",
    fontWeight: "600",
  },

  modalSaveText: {
    color: "#FFF",
    fontWeight: "600",
  },
});