import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "../../services/api";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const MAX_STARS = 5;

const competencies = [
  "Contribution",
  "Communication",
  "Collaboration",
  "Critical thinking",
  "Problem Solving",
] as const;

type Competency = (typeof competencies)[number];

export default function SelfAssessment() {
  const params = useLocalSearchParams();

  const reflectionId = Array.isArray(params.reflectionId)
    ? params.reflectionId[0]
    : params.reflectionId;

  const [ratings, setRatings] = useState<Record<Competency, number>>({
    Contribution: 0,
    Communication: 0,
    Collaboration: 0,
    "Critical thinking": 0,
    "Problem Solving": 0,
  });

  const [assessmentExists, setAssessmentExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing self-assessment
  useEffect(() => {
    const loadAssessment = async () => {
      if (!reflectionId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/self-assessments/${reflectionId}`
        );

        if (response.status === 404) {
          setAssessmentExists(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load self assessment");
        }

        const data = await response.json();

        setRatings({
          Contribution: data.contribution ?? 0,
          Communication: data.communication ?? 0,
          Collaboration: data.collaboration ?? 0,
          "Critical thinking": data.critical_thinking ?? 0,
          "Problem Solving": data.problem_solving ?? 0,
        });

        setAssessmentExists(true);
      } catch (error) {
        console.error("Error loading self assessment:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessment();
  }, [reflectionId]);

  const setRating = (
    competency: Competency,
    value: number
  ) => {
    setRatings((prev) => ({
      ...prev,
      [competency]: value,
    }));
  };

  const validateRatings = () => {
    return competencies.every(
      (competency) => ratings[competency] >= 1
    );
  };

  const handleSubmit = async () => {
    if (!reflectionId) {
      Alert.alert(
        "Error",
        "Reflection ID is missing."
      );
      return;
    }

    if (!validateRatings()) {
      Alert.alert(
        "Incomplete Assessment",
        "Please rate all five competencies before continuing."
      );
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        contribution: ratings.Contribution,
        communication: ratings.Communication,
        collaboration: ratings.Collaboration,
        critical_thinking: ratings["Critical thinking"],
        problem_solving: ratings["Problem Solving"],
      };

      let response;

      if (assessmentExists) {
        // Update existing assessment
        response = await fetch(
          `${API_BASE_URL}/api/self-assessments/${reflectionId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(payload),
          }
        );
      } else {
        // Create first assessment
        response = await fetch(
          `${API_BASE_URL}/api/self-assessments`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              reflection_id: Number(reflectionId),
              ...payload,
            }),
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save self assessment"
        );
      }

      setAssessmentExists(true);

      console.log(
        "Self assessment saved:",
        data
      );

      router.push({
        pathname: "/(tabs)/assessment-result",

        params: {
          reflectionId: String(reflectionId),
        },
      });
    } catch (error) {
      console.error(
        "Error saving self assessment:",
        error
      );

      Alert.alert(
        "Error",
        "Could not save the self assessment."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading self assessment...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}

        <Text style={styles.title}>
          Self Assessment
        </Text>

        <Text style={styles.subtitle}>
          Rate yourself for each competency.
        </Text>

        {/* Competency rows */}

        <View style={styles.list}>
          {competencies.map((competency) => (
            <View
              key={competency}
              style={styles.row}
            >
              <Text style={styles.rowLabel}>
                {competency}
              </Text>

              <View style={styles.starRow}>
                {Array.from(
                  { length: MAX_STARS },
                  (_, i) => i + 1
                ).map((star) => {
                  const filled =
                    star <= ratings[competency];

                  return (
                    <Pressable
                      key={star}
                      onPress={() =>
                        setRating(
                          competency,
                          star
                        )
                      }
                      hitSlop={6}
                      accessibilityLabel={`Rate ${competency} ${star} out of ${MAX_STARS}`}
                    >
                      <Ionicons
                        name={
                          filled
                            ? "star"
                            : "star-outline"
                        }
                        size={22}
                        color={
                          filled
                            ? "#E08E00"
                            : "#B0B0B0"
                        }
                        style={styles.star}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Submit */}

        <Pressable
          style={[
            styles.submitButton,
            isSaving &&
              styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={isSaving}
        >
          <Text
            style={
              styles.submitButtonText
            }
          >
            {isSaving
              ? "Saving..."
              : "Submit Self Assessment"}
          </Text>
        </Pressable>
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
    fontSize: 15,
    color: "#555",
    marginTop: 5,
    marginBottom: 25,
  },

  list: {
    gap: 18,
    marginBottom: 30,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },

  rowLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },

  starRow: {
    flexDirection: "row",
  },

  star: {
    marginLeft: 6,
  },

  submitButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#3F2A88",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.6,
  },
});