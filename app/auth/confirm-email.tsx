import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import AuthLayout from "./AuthLayout";

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ConfirmEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!otp.trim() || otp.length < 4) {
      Alert.alert("Invalid OTP", "Please enter the OTP sent to your email");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://black-cat.up.railway.app/auth/confirm-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            OTP: otp,
          }),
        }
      );

      const data = await response.json();

      console.log("STATUS:", response.status);
      console.log("DATA:", data);

      if (!response.ok) {
        Alert.alert(
          "Verification Failed",
          data.err_message || data.message || "Invalid OTP"
        );
        return;
      }

      Alert.alert("Success", "Email verified! You can now login");
      router.replace("/auth/login");
    } catch (error) {
      console.log(error);
      Alert.alert("Network Error", "Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          BLACK<Text style={styles.accent}>CAT</Text>
        </Text>

        <Text style={styles.title}>
          VERIFY YOUR <Text style={styles.accent}>IDENTITY</Text>
        </Text>

        <Text style={styles.sub}>
          Enter the OTP sent to{"\n"}
          <Text style={styles.accent}>{email}</Text>
        </Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.label}>VERIFICATION CODE</Text>

        <View style={styles.input}>
          <Ionicons
            name="key-outline"
            size={18}
            color={Colors.textSecondary}
          />
          <TextInput
            placeholder="Enter OTP"
            placeholderTextColor={Colors.textSecondary}
            style={styles.inputText}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        {/* BUTTON */}
        <Pressable
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "VERIFYING..." : "CONFIRM IDENTITY"}
          </Text>
        </Pressable>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Already verified?{" "}
          <Text
            style={styles.accent}
            onPress={() => router.replace("/auth/login")}
          >
            GO TO LOGIN
          </Text>
        </Text>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 40,
    alignItems: "center",
  },
  logo: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  accent: {
    color: Colors.primary,
  },
  title: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  sub: {
    marginTop: 8,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    marginTop: 40,
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 26,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#020817",
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  inputText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 20,
    letterSpacing: 8,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#00382C",
    fontWeight: "700",
    letterSpacing: 1,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    color: Colors.textSecondary,
  },
});