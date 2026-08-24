import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "../../services/api";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const PURPLE = "#3F2A88";
const SELF_COLOR = "#4169E1";
const ASSESSOR_COLOR = "#E0A11B";
const MAX_SCORE = 5;

// ======================================================
// TYPES
// ======================================================

type Point = {
  x: number;
  y: number;
};

type LineSegmentProps = {
  color: string;
  from: Point;
  thickness?: number;
  to: Point;
};

type RadarSeriesProps = {
  center: Point;
  color: string;
  radius: number;
  scores: number[];
};

// ======================================================
// RADAR CHART HELPERS
// ======================================================

function pointForScore(
  center: Point,
  radius: number,
  axisIndex: number,
  totalAxes: number,
  score: number
) {
  const angle =
    -Math.PI / 2 +
    axisIndex * ((2 * Math.PI) / totalAxes);

  const distance =
    radius * (score / MAX_SCORE);

  return {
    x:
      center.x +
      Math.cos(angle) * distance,

    y:
      center.y +
      Math.sin(angle) * distance,
  };
}

function LineSegment({
  color,
  from,
  thickness = 1,
  to,
}: LineSegmentProps) {
  const xDistance =
    to.x - from.x;

  const yDistance =
    to.y - from.y;

  const length =
    Math.sqrt(
      xDistance ** 2 +
        yDistance ** 2
    );

  const angle =
    (Math.atan2(
      yDistance,
      xDistance
    ) *
      180) /
    Math.PI;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.lineSegment,
        {
          backgroundColor: color,
          height: thickness,

          left:
            (from.x + to.x) / 2 -
            length / 2,

          top:
            (from.y + to.y) / 2 -
            thickness / 2,

          transform: [
            {
              rotate: `${angle}deg`,
            },
          ],

          width: length,
        },
      ]}
    />
  );
}

function RadarSeries({
  center,
  color,
  radius,
  scores,
}: RadarSeriesProps) {
  const totalAxes =
    scores.length;

  const points =
    scores.map(
      (score, index) =>
        pointForScore(
          center,
          radius,
          index,
          totalAxes,
          score
        )
    );

  return (
    <>
      {points.map(
        (point, index) => (
          <LineSegment
            key={`${color}-line-${index}`}
            color={color}
            from={point}
            thickness={3}
            to={
              points[
                (index + 1) %
                  points.length
              ]
            }
          />
        )
      )}

      {points.map(
        (point, index) => (
          <View
            key={`${color}-point-${index}`}
            style={[
              styles.dataPoint,
              {
                backgroundColor:
                  color,

                left:
                  point.x - 5,

                top:
                  point.y - 5,
              },
            ]}
          />
        )
      )}
    </>
  );
}

function RadarChart({
  size,
  scores,
}: {
  size: number;
  scores: number[];
}) {
  const center = {
    x: size / 2,
    y: size / 2,
  };

  const radius =
    size * 0.27;

  const totalAxes =
    scores.length;

  const outerPoints =
    Array.from(
      {
        length: totalAxes,
      },
      (_, axisIndex) =>
        pointForScore(
          center,
          radius,
          axisIndex,
          totalAxes,
          MAX_SCORE
        )
    );

  return (
    <View
      accessibilityLabel="Radar chart showing your self assessment scores."
      accessibilityRole="image"
      style={[
        styles.chart,
        {
          width: size,
          height: size,
        },
      ]}
    >
      {[0.25, 0.5, 0.75, 1].map(
        (level) => {
          const levelPoints =
            Array.from(
              {
                length:
                  totalAxes,
              },
              (_, axisIndex) =>
                pointForScore(
                  center,
                  radius,
                  axisIndex,
                  totalAxes,
                  MAX_SCORE *
                    level
                )
            );

          return levelPoints.map(
            (point, index) => (
              <LineSegment
                key={`grid-${level}-${index}`}
                color={
                  level === 1
                    ? "#AAA6B3"
                    : "#DDD9E4"
                }
                from={point}
                to={
                  levelPoints[
                    (index + 1) %
                      levelPoints.length
                  ]
                }
              />
            )
          );
        }
      )}

      {outerPoints.map(
        (point, index) => (
          <LineSegment
            key={`axis-${index}`}
            color="#D4D0DA"
            from={center}
            to={point}
          />
        )
      )}

      <RadarSeries
        center={center}
        color={SELF_COLOR}
        radius={radius}
        scores={scores}
      />

      <Text
        style={[
          styles.chartLabel,
          styles.topLabel,
        ]}
      >
        Communication
      </Text>

      <Text
        style={[
          styles.chartLabel,
          styles.topRightLabel,
        ]}
      >
        Collaboration
      </Text>

      <Text
        style={[
          styles.chartLabel,
          styles.bottomRightLabel,
        ]}
      >
        Critical Thinking
      </Text>

      <Text
        style={[
          styles.chartLabel,
          styles.bottomLeftLabel,
        ]}
      >
        Problem Solving
      </Text>

      <Text
        style={[
          styles.chartLabel,
          styles.topLeftLabel,
        ]}
      >
        Contribution
      </Text>
    </View>
  );
}

// ======================================================
// SCORE CARD
// ======================================================

function ScoreCard({
  color,
  icon,
  label,
  score,
}: {
  color: string;

  icon:
    | "person-outline"
    | "briefcase-outline";

  label: string;

  score: string;
}) {
  return (
    <View
      style={
        styles.scoreCard
      }
    >
      <View
        style={[
          styles.scoreIcon,
          {
            backgroundColor:
              `${color}18`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={color}
        />
      </View>

      <View>
        <Text
          style={
            styles.scoreLabel
          }
        >
          {label}
        </Text>

        <Text
          style={[
            styles.scoreValue,
            {
              color,
            },
          ]}
        >
          {score}

          <Text
            style={
              styles.scoreMaximum
            }
          >
            {" "}
            / 5
          </Text>
        </Text>
      </View>
    </View>
  );
}

// ======================================================
// MAIN SCREEN
// ======================================================

export default function AssessmentResultScreen() {
  const { width } =
    useWindowDimensions();

  const chartSize =
    Math.min(
      width - 40,
      350
    );

  // ====================================================
  // GET CURRENT REFLECTION ID
  // ====================================================

  const params =
    useLocalSearchParams();

  const reflectionId =
    Array.isArray(
      params.reflectionId
    )
      ? params.reflectionId[0]
      : params.reflectionId;

  // ====================================================
  // STATE
  // ====================================================

  const [
    selfScores,
    setSelfScores,
  ] = useState<number[]>([
    0, 0, 0, 0, 0,
  ]);

  const [
    assessorScore,
    setAssessorScore,
  ] = useState<
    number | null
  >(null);

  const [
    feedback,
    setFeedback,
  ] = useState(
    "This reflection has not been assessed yet."
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  // ====================================================
  // LOAD RESULT
  // ====================================================

  useEffect(() => {
    const loadResult =
      async () => {
        if (
          !reflectionId
        ) {
          console.log(
            "ERROR: reflectionId is missing"
          );

          setIsLoading(
            false
          );

          return;
        }

        console.log(
          "========== ASSESSMENT RESULT =========="
        );

        console.log(
          "reflectionId:",
          reflectionId
        );

        console.log(
          "API_BASE_URL:",
          API_BASE_URL
        );

        try {
          // ============================================
          // LOAD SELF ASSESSMENT
          // ============================================

          const selfUrl =
            `${API_BASE_URL}/api/self-assessments/${reflectionId}`;

          console.log(
            "Self Assessment URL:",
            selfUrl
          );

          const selfResponse =
            await fetch(
              selfUrl
            );

          console.log(
            "Self Assessment Status:",
            selfResponse.status
          );

          if (
            selfResponse.ok
          ) {
            const selfData =
              await selfResponse.json();

            console.log(
              "Self Assessment Data:",
              selfData
            );

            setSelfScores([
              Number(
                selfData.communication
              ) || 0,

              Number(
                selfData.collaboration
              ) || 0,

              Number(
                selfData.critical_thinking
              ) || 0,

              Number(
                selfData.problem_solving
              ) || 0,

              Number(
                selfData.contribution
              ) || 0,
            ]);
          } else {
            const selfError =
              await selfResponse.text();

            console.log(
              "Self Assessment API Error:",
              selfError
            );
          }

          // ============================================
          // LOAD ASSESSOR ASSESSMENT
          // ============================================

          const assessmentUrl =
            `${API_BASE_URL}/api/assessments/${reflectionId}`;

          console.log(
            "Assessment URL:",
            assessmentUrl
          );

          const assessmentResponse =
            await fetch(
              assessmentUrl
            );

          console.log(
            "Assessment Response Status:",
            assessmentResponse.status
          );

          if (
            assessmentResponse.ok
          ) {
            const assessmentData =
              await assessmentResponse.json();

            console.log(
              "Assessment Data:",
              assessmentData
            );

            if (
              assessmentData.assessor_score !==
                null &&
              assessmentData.assessor_score !==
                undefined
            ) {
              const score =
                Number(
                  assessmentData.assessor_score
                );

              setAssessorScore(
                score
              );
            } else {
              setAssessorScore(
                null
              );
            }

            if (
              assessmentData.feedback &&
              String(
                assessmentData.feedback
              ).trim() !==
                ""
            ) {
              setFeedback(
                assessmentData.feedback
              );
            } else {
              setFeedback(
                "This reflection has not received assessor feedback yet."
              );
            }
          } else {
            const assessmentError =
              await assessmentResponse.text();

            console.log(
              "Assessment API Error:",
              assessmentError
            );

            setAssessorScore(
              null
            );

            setFeedback(
              "This reflection has not been assessed yet."
            );
          }
        } catch (
          error
        ) {
          console.error(
            "Error loading assessment result:",
            error
          );

          setAssessorScore(
            null
          );

          setFeedback(
            "Unable to load assessor feedback."
          );
        } finally {
          setIsLoading(
            false
          );

          console.log(
            "========== LOAD FINISHED =========="
          );
        }
      };

    loadResult();
  }, [reflectionId]);

  // ====================================================
  // SUBMIT REFLECTION
  // ====================================================

  const handleSubmitReflection =
    async () => {
      if (
        !reflectionId
      ) {
        Alert.alert(
          "Error",
          "Reflection ID is missing."
        );

        return;
      }

      try {
        setIsSubmitting(
          true
        );

        const response =
          await fetch(
            `${API_BASE_URL}/api/reflections/${reflectionId}/submit`,
            {
              method:
                "PUT",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data.message ||
              "Failed to submit reflection"
          );
        }

        console.log(
          "Reflection submitted:",
          data
        );

        Alert.alert(
          "Submitted",
          "Your reflection has been submitted successfully.",
          [
            {
              text: "OK",

              onPress: () =>
                router.replace(
                  "/(tabs)/reflection-list"
                ),
            },
          ]
        );
      } catch (
        error
      ) {
        console.error(
          "Submit reflection error:",
          error
        );

        Alert.alert(
          "Error",
          "Could not submit the reflection. Please try again."
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

  // ====================================================
  // CALCULATE SELF ASSESSMENT AVERAGE
  // ====================================================

  const validSelfScores =
    selfScores.filter(
      (score) =>
        score > 0
    );

  const selfAverage =
    validSelfScores.length >
    0
      ? validSelfScores.reduce(
          (
            sum,
            score
          ) =>
            sum +
            score,
          0
        ) /
        validSelfScores.length
      : 0;

  // ====================================================
  // LOADING SCREEN
  // ====================================================

  if (
    isLoading
  ) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <Text
          style={
            styles.loadingText
          }
        >
          Loading assessment result...
        </Text>
      </View>
    );
  }

  // ====================================================
  // SCREEN
  // ====================================================

  return (
    <ScrollView
      contentContainerStyle={
        styles.scrollContent
      }
      style={
        styles.container
      }
    >
      <View
        style={
          styles.content
        }
      >
        {/* HEADER */}

        <View
          style={
            styles.heading
          }
        >
          <View
            style={
              styles.eyebrowRow
            }
          >
            <View
              style={
                styles.eyebrowLine
              }
            />

            <Text
              style={
                styles.eyebrow
              }
            >
              REFLECTION · RESULT
            </Text>
          </View>

          <Text
            style={
              styles.title
            }
          >
            Assessment Result
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Review your self assessment and assessor feedback.
          </Text>
        </View>

        {/* RADAR CHART */}

        <View
          style={
            styles.chartCard
          }
        >
          <RadarChart
            size={
              chartSize
            }
            scores={
              selfScores
            }
          />

          <View
            style={
              styles.legend
            }
          >
            <View
              style={
                styles.legendItem
              }
            >
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor:
                      SELF_COLOR,
                  },
                ]}
              />

              <Text
                style={
                  styles.legendText
                }
              >
                You
              </Text>
            </View>
          </View>
        </View>

        {/* SCORES */}

        <View
          style={
            styles.scoreRow
          }
        >
          <ScoreCard
            color={
              SELF_COLOR
            }
            icon="person-outline"
            label="You"
            score={
              selfAverage.toFixed(
                1
              )
            }
          />

          <ScoreCard
            color={
              ASSESSOR_COLOR
            }
            icon="briefcase-outline"
            label="Assessor"
            score={
              assessorScore !==
              null
                ? assessorScore.toFixed(
                    1
                  )
                : "-"
            }
          />
        </View>

        {/* FEEDBACK */}

        <View
          style={
            styles.feedbackSection
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Assessor Feedback
          </Text>

          <View
            style={
              styles.feedbackCard
            }
          >
            <View
              style={
                styles.quoteIcon
              }
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={20}
                color={
                  PURPLE
                }
              />
            </View>

            <Text
              style={
                styles.feedbackText
              }
            >
              {feedback}
            </Text>
          </View>
        </View>

        {/* SUBMIT REFLECTION */}

        <Pressable
          accessibilityRole="button"
          disabled={
            isSubmitting
          }
          onPress={
            handleSubmitReflection
          }
          style={({
            pressed,
          }) => [
            styles.submitButton,

            isSubmitting &&
              styles.disabledButton,

            pressed &&
              !isSubmitting &&
              styles.submitButtonPressed,
          ]}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.submitButtonText
            }
          >
            {isSubmitting
              ? "Submitting..."
              : "Submit Reflection"}
          </Text>
        </Pressable>

        {/* REFLECTION HISTORY */}

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.replace(
              "/(tabs)/reflection-list"
            )
          }
          style={({
            pressed,
          }) => [
            styles.historyButton,

            pressed &&
              styles.historyButtonPressed,
          ]}
        >
          <Ionicons
            name="time-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.historyButtonText
            }
          >
            Reflection History
          </Text>
        </Pressable>

        {/* HOME */}

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.replace(
              "/(tabs)/reflector-home"
            )
          }
          style={({
            pressed,
          }) => [
            styles.homeButton,

            pressed &&
              styles.homeButtonPressed,
          ]}
        >
          <Ionicons
            name="home-outline"
            size={21}
            color={
              PURPLE
            }
          />

          <Text
            style={
              styles.homeButtonText
            }
          >
            Back to Reflector Home
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F7F6FA",
    },

    loadingContainer: {
      flex: 1,
      backgroundColor:
        "#F7F6FA",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    loadingText: {
      color:
        "#6B6675",
      fontSize: 16,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: 36,
    },

    content: {
      alignSelf:
        "center",
      maxWidth: 560,
      paddingHorizontal: 20,
      paddingTop: 28,
      width: "100%",
    },

    heading: {
      marginBottom: 20,
    },

    eyebrowRow: {
      alignItems:
        "center",
      flexDirection:
        "row",
      gap: 8,
      marginBottom: 8,
    },

    eyebrowLine: {
      backgroundColor:
        PURPLE,
      borderRadius: 2,
      height: 3,
      width: 24,
    },

    eyebrow: {
      color: PURPLE,
      fontSize: 12,
      fontWeight:
        "800",
      letterSpacing:
        0.8,
    },

    title: {
      color:
        "#161221",
      fontSize: 30,
      fontWeight:
        "800",
      letterSpacing:
        -0.6,
    },

    subtitle: {
      color:
        "#6B6675",
      fontSize: 15,
      lineHeight: 22,
      marginTop: 7,
    },

    chartCard: {
      alignItems:
        "center",
      backgroundColor:
        "#FFFFFF",
      borderColor:
        "#E7E3EC",
      borderRadius: 22,
      borderWidth: 1,
      paddingBottom: 18,

      shadowColor:
        "#281F3E",

      shadowOffset: {
        width: 0,
        height: 6,
      },

      shadowOpacity:
        0.08,

      shadowRadius: 14,

      elevation: 3,
    },

    chart: {
      position:
        "relative",
    },

    lineSegment: {
      borderRadius: 3,
      position:
        "absolute",
    },

    dataPoint: {
      borderColor:
        "#FFFFFF",
      borderRadius: 5,
      borderWidth: 2,
      height: 10,
      position:
        "absolute",
      width: 10,
    },

    chartLabel: {
      color:
        "#4D4857",
      fontSize: 11,
      fontWeight:
        "600",
      position:
        "absolute",
    },

    topLabel: {
      left: 0,
      textAlign:
        "center",
      top: 10,
      width: "100%",
    },

    topRightLabel: {
      right: 5,
      top: "31%",
    },

    bottomRightLabel: {
      bottom: "18%",
      right: 5,
    },

    bottomLeftLabel: {
      bottom: "18%",
      left: 5,
    },

    topLeftLabel: {
      left: 5,
      top: "31%",
    },

    legend: {
      flexDirection:
        "row",
      gap: 20,
    },

    legendItem: {
      alignItems:
        "center",
      flexDirection:
        "row",
      gap: 7,
    },

    legendDot: {
      borderRadius: 4,
      height: 8,
      width: 8,
    },

    legendText: {
      color:
        "#5B5665",
      fontSize: 13,
      fontWeight:
        "600",
    },

    scoreRow: {
      flexDirection:
        "row",
      gap: 12,
      marginTop: 16,
    },

    scoreCard: {
      alignItems:
        "center",
      backgroundColor:
        "#FFFFFF",
      borderColor:
        "#E7E3EC",
      borderRadius: 16,
      borderWidth: 1,
      flex: 1,
      flexDirection:
        "row",
      gap: 11,
      minHeight: 84,
      padding: 14,
    },

    scoreIcon: {
      alignItems:
        "center",
      borderRadius: 12,
      height: 42,
      justifyContent:
        "center",
      width: 42,
    },

    scoreLabel: {
      color:
        "#6B6675",
      fontSize: 13,
      fontWeight:
        "600",
    },

    scoreValue: {
      fontSize: 24,
      fontWeight:
        "800",
      marginTop: 2,
    },

    scoreMaximum: {
      color:
        "#8D8797",
      fontSize: 13,
      fontWeight:
        "600",
    },

    feedbackSection: {
      marginTop: 24,
    },

    sectionTitle: {
      color:
        "#161221",
      fontSize: 18,
      fontWeight:
        "800",
      marginBottom: 10,
    },

    feedbackCard: {
      alignItems:
        "flex-start",
      backgroundColor:
        "#FFFFFF",
      borderColor:
        "#E7E3EC",
      borderRadius: 16,
      borderWidth: 1,
      flexDirection:
        "row",
      gap: 12,
      padding: 16,
    },

    quoteIcon: {
      alignItems:
        "center",
      backgroundColor:
        "#F0ECFF",
      borderRadius: 10,
      height: 38,
      justifyContent:
        "center",
      width: 38,
    },

    feedbackText: {
      color:
        "#4D4857",
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
    },

    submitButton: {
      alignItems:
        "center",

      backgroundColor:
        PURPLE,

      borderRadius: 14,

      flexDirection:
        "row",

      gap: 9,

      height: 54,

      justifyContent:
        "center",

      marginTop: 24,

      shadowColor:
        PURPLE,

      shadowOffset: {
        width: 0,
        height: 6,
      },

      shadowOpacity:
        0.22,

      shadowRadius: 10,

      elevation: 4,
    },

    submitButtonPressed: {
      opacity: 0.86,

      transform: [
        {
          scale:
            0.99,
        },
      ],
    },

    submitButtonText: {
      color:
        "#FFFFFF",

      fontSize: 16,

      fontWeight:
        "700",
    },

    disabledButton: {
      opacity: 0.6,
    },

    historyButton: {
      alignItems:
        "center",

      backgroundColor:
        "#5F4AA5",

      borderRadius: 14,

      flexDirection:
        "row",

      gap: 9,

      height: 54,

      justifyContent:
        "center",

      marginTop: 12,
    },

    historyButtonPressed: {
      opacity: 0.86,

      transform: [
        {
          scale:
            0.99,
        },
      ],
    },

    historyButtonText: {
      color:
        "#FFFFFF",

      fontSize: 16,

      fontWeight:
        "700",
    },

    homeButton: {
      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderColor:
        PURPLE,

      borderRadius: 14,

      borderWidth:
        1.5,

      flexDirection:
        "row",

      gap: 9,

      height: 54,

      justifyContent:
        "center",

      marginTop: 12,
    },

    homeButtonPressed: {
      opacity: 0.75,

      transform: [
        {
          scale:
            0.99,
        },
      ],
    },

    homeButtonText: {
      color:
        PURPLE,

      fontSize: 16,

      fontWeight:
        "700",
    },
  });