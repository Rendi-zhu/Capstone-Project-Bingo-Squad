import { router } from "expo-router";
import { useState } from "react";

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

export default function NewReflection() {
  const [title, setTitle] = useState("");
  const [projectGroup, setProjectGroup] = useState("");

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [activeDateMenu, setActiveDateMenu] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const days = Array.from(
    { length: 31 },
    (_, i) => `${i + 1}`
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = [
    "2025",
    "2026",
    "2027",
    "2028",
    "2029",
    "2030",
  ];

  const handleContinue = async () => {
    if (!title.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter a reflection title."
      );
      return;
    }

    if (!projectGroup.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter a project or gig."
      );
      return;
    }

    if (!day || !month || !year) {
      Alert.alert(
        "Missing Information",
        "Please select a complete date."
      );
      return;
    }

    try {
      setIsLoading(true);

      const monthNumber =
        months.indexOf(month) + 1;

      const formattedMonth = String(
        monthNumber
      ).padStart(2, "0");

      const formattedDay = String(
        day
      ).padStart(2, "0");

      const reflectionDate =
        `${year}-${formattedMonth}-${formattedDay}`;

      const response = await fetch(
        `${API_BASE_URL}/api/reflections`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            user_id: 1,

            title: title.trim(),

            project_group:
              projectGroup.trim(),

            reflection_date:
              reflectionDate,

            worked_on: "",

            challenges: "",

            learned: "",

            improvement: "",

            status: "draft",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create reflection"
        );
      }

      console.log(
        "Reflection created:",
        data
      );

      router.push({
        pathname: "/(tabs)/reflection",

        params: {
          reflectionId: String(
            data.reflectionId
          ),
        },
      });
    } catch (error) {
      console.error(
        "Error creating reflection:",
        error
      );

      Alert.alert(
        "Error",
        "Could not create the reflection. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        {/* Header */}

        <Text style={styles.title}>
          Basic Information
        </Text>

        <Text style={styles.subtitle}>
          Tell us about your reflection
        </Text>

        {/* Reflection Title */}

        <View style={styles.field}>
          <Text style={styles.label}>
            Reflection Title
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Project Reflection"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Project/Gig */}

        <View style={styles.field}>
          <Text style={styles.label}>
            Project/Gig
          </Text>

          <TextInput
            style={styles.input}
            placeholder="What was worked on? e.g.: Name of Project"
            placeholderTextColor="#999"
            value={projectGroup}
            onChangeText={setProjectGroup}
          />
        </View>

        {/* Date */}

        <View style={styles.field}>
          <Text style={styles.label}>
            Date
          </Text>

          <View style={styles.dateRow}>
            {/* Day */}

            <View
              style={styles.dateContainer}
            >
              <Pressable
                style={styles.dateInput}
                onPress={() => {
                  setActiveDateMenu(
                    activeDateMenu === "day"
                      ? ""
                      : "day"
                  );
                }}
              >
                <Text
                  style={
                    day
                      ? styles.selectedText
                      : styles.placeholder
                  }
                >
                  {day || "Day"}
                </Text>

                <Text style={styles.arrow}>
                  ▼
                </Text>
              </Pressable>

              {activeDateMenu ===
                "day" && (
                <View
                  style={
                    styles.dateDropdown
                  }
                >
                  <ScrollView
                    nestedScrollEnabled
                  >
                    {days.map((item) => (
                      <Pressable
                        key={item}
                        style={
                          styles.dropdownOption
                        }
                        onPress={() => {
                          setDay(item);

                          setActiveDateMenu(
                            ""
                          );
                        }}
                      >
                        <Text
                          style={
                            styles.dropdownText
                          }
                        >
                          {item}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Month */}

            <View
              style={styles.dateContainer}
            >
              <Pressable
                style={styles.dateInput}
                onPress={() => {
                  setActiveDateMenu(
                    activeDateMenu ===
                      "month"
                      ? ""
                      : "month"
                  );
                }}
              >
                <Text
                  style={
                    month
                      ? styles.selectedText
                      : styles.placeholder
                  }
                >
                  {month || "Month"}
                </Text>

                <Text style={styles.arrow}>
                  ▼
                </Text>
              </Pressable>

              {activeDateMenu ===
                "month" && (
                <View
                  style={
                    styles.dateDropdown
                  }
                >
                  <ScrollView
                    nestedScrollEnabled
                  >
                    {months.map(
                      (item) => (
                        <Pressable
                          key={item}
                          style={
                            styles.dropdownOption
                          }
                          onPress={() => {
                            setMonth(item);

                            setActiveDateMenu(
                              ""
                            );
                          }}
                        >
                          <Text
                            style={
                              styles.dropdownText
                            }
                          >
                            {item}
                          </Text>
                        </Pressable>
                      )
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Year */}

            <View
              style={styles.dateContainer}
            >
              <Pressable
                style={styles.dateInput}
                onPress={() => {
                  setActiveDateMenu(
                    activeDateMenu ===
                      "year"
                      ? ""
                      : "year"
                  );
                }}
              >
                <Text
                  style={
                    year
                      ? styles.selectedText
                      : styles.placeholder
                  }
                >
                  {year || "Year"}
                </Text>

                <Text style={styles.arrow}>
                  ▼
                </Text>
              </Pressable>

              {activeDateMenu ===
                "year" && (
                <View
                  style={
                    styles.dateDropdown
                  }
                >
                  <ScrollView
                    nestedScrollEnabled
                  >
                    {years.map((item) => (
                      <Pressable
                        key={item}
                        style={
                          styles.dropdownOption
                        }
                        onPress={() => {
                          setYear(item);

                          setActiveDateMenu(
                            ""
                          );
                        }}
                      >
                        <Text
                          style={
                            styles.dropdownText
                          }
                        >
                          {item}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Continue */}

        <Pressable
          style={[
            styles.continueButton,
            isLoading &&
              styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={isLoading}
        >
          <Text
            style={
              styles.continueButtonText
            }
          >
            {isLoading
              ? "Creating..."
              : "Continue"}
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

  content: {
    width: "90%",
    alignSelf: "center",
    paddingTop: 10,
    paddingBottom: 30,
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

  field: {
    marginBottom: 22,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 15,
    justifyContent: "center",
  },

  placeholder: {
    color: "#999",
    fontSize: 15,
  },

  selectedText: {
    color: "#000",
    fontSize: 15,
  },

  arrow: {
    position: "absolute",
    right: 15,
    color: "#3F2A88",
    fontSize: 14,
  },

  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  dropdownText: {
    fontSize: 15,
    color: "#000",
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dateContainer: {
    width: "31%",
    position: "relative",
  },

  dateInput: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
  },

  dateDropdown: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    zIndex: 100,
    elevation: 10,
  },

  continueButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#3F2A88",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});