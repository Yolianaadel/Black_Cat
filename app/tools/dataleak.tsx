import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function DataLeakScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const isValidEmail = /\S+@\S+\.\S+/.test(email);

  const handleScan = async () => {
    if (!email.trim() || !isValidEmail) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        "https://black-cat.up.railway.app/user/check-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }

      setResult({
        leaked: data?.data?.leaked,
        email: data?.data?.email,
        status: data?.data?.status,
        severity: data?.data?.severity,
        message: data?.message,
        details: data?.data?.details,
        recommendations: data?.data?.recommendations || [],
      });
    } catch (error: any) {
      setResult({
        leaked: true,
        error: true,
        message: error.message || "Something went wrong",
        recommendations: ["Please try again later."],
      });
    } finally {
      setLoading(false);
    }
  };

  const danger = result?.leaked;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name="shield-alert-outline"
              size={45}
              color="#00ffcc"
            />
          </View>

          <Text style={styles.title}>
            Data <Text style={styles.accent}>Leak</Text>
          </Text>

          <Text style={styles.subtitle}>
            Check whether your email has appeared in leaked records.
          </Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.mailIconBox}>
              <Ionicons name="mail-outline" size={22} color="#00ffcc" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Email Exposure Check</Text>

              <Text style={styles.cardDesc}>
                Enter your email and scan leaked database records.
              </Text>
            </View>
          </View>

          {/* INPUT */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />

            <TextInput
              placeholder="youremail@example.com"
              placeholderTextColor="#777"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            disabled={loading || !isValidEmail}
            style={[
              styles.button,
              (!isValidEmail || loading) && styles.buttonDisabled,
            ]}
            onPress={handleScan}
          >
            {loading ? (
              <ActivityIndicator color="#001b16" />
            ) : (
              <Text style={styles.buttonText}>Check Now</Text>
            )}
          </TouchableOpacity>

          {/* INFO */}
          <View style={styles.infoRow}>
            <Ionicons name="lock-closed-outline" size={16} color="#777" />

            <Text style={styles.infoText}>
              Your email is only used for this security check.
            </Text>
          </View>
        </View>

        {/* RESULT */}
        {result && (
          <View
            style={[
              styles.resultCard,
              {
                borderColor: danger
                  ? "rgba(255,0,0,0.4)"
                  : "rgba(0,255,120,0.4)",
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <View
                style={[
                  styles.resultIcon,
                  {
                    backgroundColor: danger
                      ? "rgba(255,0,0,0.15)"
                      : "rgba(0,255,120,0.15)",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={danger ? "alert" : "check-circle"}
                  size={32}
                  color={danger ? "#ff4d4d" : "#00ff88"}
                />
              </View>

              <View>
                <Text
                  style={[
                    styles.resultTitle,
                    {
                      color: danger ? "#ff4d4d" : "#00ff88",
                    },
                  ]}
                >
                  {danger ? "Email Compromised" : "No Leak Found"}
                </Text>

                <Text style={styles.resultEmail}>{result.email || email}</Text>
              </View>
            </View>

            <Text style={styles.resultMessage}>{result.message}</Text>

            {result.details && (
              <View style={styles.detailsBox}>
                <Text style={styles.detailsText}>{result.details}</Text>
              </View>
            )}

            {/* RECOMMENDATIONS */}
            <View style={{ marginTop: 20 }}>
              <Text style={styles.recommendTitle}>Recommended Actions</Text>

              {result.recommendations.map((item: string, index: number) => (
                <View key={index} style={styles.recommendBox}>
                  <View style={styles.numberCircle}>
                    <Text style={styles.numberText}>{index + 1}</Text>
                  </View>

                  <Text style={styles.recommendText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 40,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },

  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 35,
  },

  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,255,255,0.25)",
    marginBottom: 25,
  },

  title: {
    color: "white",
    fontSize: 42,
    fontWeight: "900",
  },

  accent: {
    color: "#00ffcc",
  },

  subtitle: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },

  mailIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,255,255,0.08)",
    marginRight: 14,
  },

  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  cardDesc: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
    flexWrap: "wrap",
    flexShrink: 1,
  },

  inputContainer: {
    backgroundColor: "#0b1224",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 18,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: "white",
    paddingVertical: 18,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#00ffcc",
    paddingVertical: 18,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#001b16",
    fontSize: 17,
    fontWeight: "900",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  infoText: {
    color: "#777",
    marginLeft: 6,
    fontSize: 12,
  },

  resultCard: {
    marginTop: 25,
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  resultIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  resultTitle: {
    fontSize: 22,
    fontWeight: "900",
  },

  resultEmail: {
    color: "#94A3B8",
    marginTop: 4,
  },

  resultMessage: {
    color: "#E2E8F0",
    lineHeight: 24,
  },

  detailsBox: {
    marginTop: 18,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 18,
    padding: 15,
  },

  detailsText: {
    color: "#94A3B8",
    lineHeight: 22,
  },

  recommendTitle: {
    color: "#00ffcc",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 14,
  },

  recommendBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#0b1224",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },

  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  numberText: {
    color: "#00ffcc",
    fontWeight: "bold",
  },

  recommendText: {
    flex: 1,
    color: "#E2E8F0",
    lineHeight: 22,
  },
});
