import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "../../services/api";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Reflection() {
  const params = useLocalSearchParams();

  const reflectionId = Array.isArray(params.reflectionId)
    ? params.reflectionId[0]
    : params.reflectionId;

  const [workedOn, setWorkedOn] = useState("");
  const [challenges, setChallenges] = useState("");
  const [learning, setLearning] = useState("");
  const [improvements, setImprovements] = useState("");
  const [otherReflection, setOtherReflection] = useState("");

  const [title, setTitle] = useState("");
  const [projectGroup, setProjectGroup] = useState("");
  const [reflectionDate, setReflectionDate] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing reflection draft
  useEffect(() => {
    const loadReflection = async () => {
      if (!reflectionId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/reflections/${reflectionId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load reflection");
        }

        const data = await response.json();

        setTitle(data.title ?? "");
        setProjectGroup(data.project_group ?? "");

        if (data.reflection_date) {
          setReflectionDate(
            String(data.reflection_date).slice(0, 10)
          );
        }

        setWorkedOn(data.worked_on ?? "");
        setChallenges(data.challenges ?? "");
        setLearning(data.learned ?? "");
        setImprovements(data.improvement ?? "");
        setOtherReflection(data.other_reflection ?? "");
      } catch (error) {
        console.error("Error loading reflection:", error);

        Alert.alert(
          "Error",
          "Could not load the reflection."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadReflection();
  }, [reflectionId]);

  // Save reflection as draft
  const saveDraft = async () => {
    if (!reflectionId) {
      Alert.alert(
        "Error",
        "Reflection ID is missing."
      );

      return false;
    }

    try {
      setIsSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/reflections/${reflectionId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: 1,
            title,
            project_group: projectGroup,
            reflection_date: reflectionDate,

            worked_on: workedOn,
            challenges: challenges,
            learned: learning,
            improvement: improvements,
            other_reflection: otherReflection,

            status: "draft",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save reflection"
        );
      }

      console.log(
        "Reflection draft saved:",
        data
      );

      return true;
    } catch (error) {
      console.error(
        "Error saving reflection:",
        error
      );

      Alert.alert(
        "Error",
        "Could not save the draft. Please try again."
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Save Draft button
  const handleSaveDraft = async () => {
    const success = await saveDraft();

    if (success) {
      Alert.alert(
        "Saved",
        "Your reflection draft has been saved."
      );
    }
  };

  // Next button
  const handleNext = async () => {
    const success = await saveDraft();

    if (!success) {
      return;
    }

    router.push({
      pathname: "/(tabs)/upload-evidence",

      params: {
        reflectionId: String(reflectionId),
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading reflection...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        {/* Header */}

        <Text style={styles.title}>
          Writing Reflection...
        </Text>

        <Text style={styles.subtitle}>
          Take some time to reflect on your experience.
        </Text>

        {/* What was worked on? */}

        <View style={styles.section}>
          <Text style={styles.label}>
            What was worked on?
          </Text>

          <TextInput
            style={styles.textBox}
            multiline
            textAlignVertical="top"
            placeholder="Describe the task/project/gig worked on."
            placeholderTextColor="#999"
            value={workedOn}
            onChangeText={setWorkedOn}
            maxLength={2000}
          />

          <Text style={styles.wordCount}>
            {workedOn.length} / 2000 characters
          </Text>
        </View>

        {/* Challenges */}

        <View style={styles.section}>
          <Text style={styles.label}>
            What challenges were faced?
          </Text>

          <TextInput
            style={styles.textBox}
            multiline
            textAlignVertical="top"
            placeholder="Describe some setbacks for example."
            placeholderTextColor="#999"
            value={challenges}
            onChangeText={setChallenges}
            maxLength={2000}
          />

          <Text style={styles.wordCount}>
            {challenges.length} / 2000 characters
          </Text>
        </View>

        {/* Learning */}

        <View style={styles.section}>
          <Text style={styles.label}>
            What did you learn from this experience?
          </Text>

          <TextInput
            style={styles.textBox}
            multiline
            textAlignVertical="top"
            placeholder="What was learnt, new, or insightful to you?"
            placeholderTextColor="#999"
            value={learning}
            onChangeText={setLearning}
            maxLength={2000}
          />

          <Text style={styles.wordCount}>
            {learning.length} / 2000 characters
          </Text>
        </View>

        {/* Improvements */}

        <View style={styles.section}>
          <Text style={styles.label}>
            What improvements will be made for the future?
          </Text>

          <TextInput
            style={styles.textBox}
            multiline
            textAlignVertical="top"
            placeholder="What can be done differently next project/gig?"
            placeholderTextColor="#999"
            value={improvements}
            onChangeText={setImprovements}
            maxLength={2000}
          />

          <Text style={styles.wordCount}>
            {improvements.length} / 2000 characters
          </Text>
        </View>

        {/* Additional Reflection */}

        <View style={styles.section}>
          <Text style={styles.label}>
            What else would you like to reflect on?
          </Text>

          <TextInput
            style={styles.textBox}
            multiline
            textAlignVertical="top"
            placeholder="Write down any other thoughts you may have..."
            placeholderTextColor="#999"
            value={otherReflection}
            onChangeText={setOtherReflection}
            maxLength={2000}
          />

          <Text style={styles.wordCount}>
            {otherReflection.length} / 2000 characters
          </Text>
        </View>

        {/* Navigation Buttons */}

        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.saveButton,
              isSaving && styles.disabledButton,
            ]}
            onPress={handleSaveDraft}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving
                ? "Saving..."
                : "Save Draft"}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.nextButton,
              isSaving && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={isSaving}
          >
            <Text style={styles.nextButtonText}>
              {isSaving
                ? "Saving..."
                : "Next"}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 16,
    color: "#555",
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
    fontSize: 16,
    color: "#555",
    marginTop: 5,
    marginBottom: 30,
  },

  section: {
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#000",
  },

  textBox: {
    width: "100%",
    height: 150,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
  },

  wordCount: {
    marginTop: 6,
    textAlign: "right",
    color: "#777",
    fontSize: 13,
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 5,
  },

  saveButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#3F2A88",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonText: {
    color: "#3F2A88",
    fontSize: 16,
    fontWeight: "600",
  },

  nextButton: {
    flex: 1,
    height: 50,
    backgroundColor: "#3F2A88",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.6,
  },
});