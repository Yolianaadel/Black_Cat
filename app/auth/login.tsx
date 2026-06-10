import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
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

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async () => {
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Missing Password", "Please enter your password");
      return;
    }

    try {
      setLoading(true);

      const fcmToken = (await AsyncStorage.getItem("fcm_token")) ?? "";

      const response = await fetch(
        "https://black-cat.up.railway.app/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
            FCM: fcmToken,
          }),
        },
      );

      const data = await response.json();

      console.log("STATUS:", response.status);
      console.log("DATA:", data);
      
      if (!response.ok) {
        Alert.alert(
          "Login Failed",
          data.err_message || data.message || "Invalid credentials",
        );
        return;
      }

      const { access_token, refresh_token } = data.data.credentials;
      await AsyncStorage.setItem("access_token", access_token);
      await AsyncStorage.setItem("refresh_token", refresh_token);
      await AsyncStorage.setItem("login_date", Date.now().toString());
      await AsyncStorage.setItem("user_email", email); 


      Alert.alert("Success", "Welcome back to Black Cat");
      router.replace("/tools/dashboard");
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
          ACCESS THE <Text style={styles.accent}>COMMAND CENTER</Text>
        </Text>

        <Text style={styles.sub}>Secure authentication required</Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        {/* EMAIL */}
        <Text style={styles.label}>COMMAND CENTER EMAIL</Text>

        <View style={styles.input}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={Colors.textSecondary}
          />
          <TextInput
            placeholder="contact@hq.security"
            placeholderTextColor={Colors.textSecondary}
            style={styles.inputText}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* PASSWORD */}
        <Text style={styles.label}>ENCRYPTION SECRET</Text>

        <View style={styles.input}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={Colors.textSecondary}
          />
          <TextInput
            secureTextEntry={!showPassword}
            placeholder="Enter your password"
            placeholderTextColor={Colors.textSecondary}
            style={styles.inputText}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPassword((prev) => !prev)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={Colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* BUTTON */}
        <Pressable
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "AUTHENTICATING..." : "ACCESS DASHBOARD"}
          </Text>
        </Pressable>

        {/* FOOTER */}
        <Text style={styles.footer}>
          New to Black Cat?{" "}
          <Text
            style={styles.accent}
            onPress={() => router.push("/auth/register")}
          >
            CREATE ACCOUNT
          </Text>
        </Text>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    padding: 20,
    alignItems: "center",
  },
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
