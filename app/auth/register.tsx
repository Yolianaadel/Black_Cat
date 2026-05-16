import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
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

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Regex
  const nameRegex = /^[a-zA-Z]{2,}(\s[a-zA-Z]{2,}){1,2}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^.{7,}$/;

  const handleRegister = async () => {
    if (!nameRegex.test(name)) {
      Alert.alert("Invalid Name", "Please enter your full name");
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email");
      return;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Weak Encryption Secret",
        "Password must be at least 7 characters",
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://black-cat.up.railway.app/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: name,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
          }),
        },
      );

      const data = await response.json();
      console.log("STATUS:", response.status);
      console.log("DATA:", data);

      if (!response.ok) {
        Alert.alert(
          "Registration Failed",
          data.err_message || data.message || "Something went wrong",
        );
        return;
      }
      Alert.alert("Success", "Account created successfully");

      router.replace({
        pathname: "/auth/confirm-email",
        params: { email: email },
      });
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
          JOIN THE <Text style={styles.accent}>RESISTANCE</Text>
        </Text>

        <Text style={styles.sub}>Deploy advanced security for your team</Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        {/* FULL NAME */}
        <Text style={styles.label}>FULL NAME</Text>

        <View style={styles.input}>
          <Ionicons
            name="person-outline"
            size={18}
            color={Colors.textSecondary}
          />

          <TextInput
            placeholder="Enter your name"
            placeholderTextColor={Colors.textSecondary}
            style={styles.inputText}
            value={name}
            onChangeText={setName}
          />
        </View>

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

        {/* CONFIRM PASSWORD */}
        <Text style={styles.label}>CONFIRM ENCRYPTION SECRET</Text>

        <View style={styles.input}>
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={Colors.textSecondary}
          />

          <TextInput
            secureTextEntry={!showPassword}
            placeholder="Confirm your password"
            placeholderTextColor={Colors.textSecondary}
            style={styles.inputText}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* TERMS */}
        <View style={styles.terms}>
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={Colors.primary}
          />

          <Text style={styles.termsText}>
            By creating an account, you agree to our{" "}
            <Text style={styles.link}>Service Protocols</Text> and{" "}
            <Text style={styles.link}>Security Policies</Text>.
          </Text>
        </View>

        {/* BUTTON */}
        <Pressable
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "CREATING ACCOUNT..." : "DEPLOY ACCOUNT"}
          </Text>
        </Pressable>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Already part of Black Cat?{" "}
          <Text style={styles.accent} onPress={() => router.push("/")}>
            ACCESS DASHBOARD
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

  terms: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 16,
    alignItems: "flex-start",
  },

  termsText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },

  link: {
    color: Colors.primary,
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
