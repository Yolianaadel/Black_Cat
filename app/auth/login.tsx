import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import AuthLayout from "./AuthLayout";import {
  Alert,
  Pressable,
  ScrollView,
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

  // Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^.{8,}$/; // أقل حاجة 8 حروف

  const handleLogin = () => {
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid operator email");
      return;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Weak Encryption Secret",
        "Password must be at least 8 characters",
      );
      return;
    }
    // ✅ لو كله تمام
    router.replace("/"); // أو /home حسب اسم الصفحة عندك
  };

  return (
    <AuthLayout>
      {/* TITLE */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          BLACK<Text style={styles.accent}>CAT</Text>
        </Text>

        <Text style={styles.secure}>
          SECURE <Text style={styles.accent}>ACCESS</Text>
        </Text>
        <Text style={styles.sub}>
          Re-authenticating with Black Cat Terminal
        </Text>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        {/* EMAIL */}
        <Text style={styles.label}>OPERATOR EMAIL</Text>
        <View style={styles.input}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={Colors.textSecondary}
          />
          <TextInput
            placeholder="operator@blackcat.io"
            placeholderTextColor={Colors.textSecondary}
            style={styles.inputText}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.rowBetween}>
          <Text style={styles.label}>ENCRYPTION SECRET</Text>
          <Text style={styles.link}>LOST KEY?</Text>
        </View>

        <View style={styles.input}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={Colors.textSecondary}
          />

          <TextInput
            secureTextEntry={!showPassword} // 👈 هنا الأكشن
            placeholder="••••••••••••"
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
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>
            INITIALIZE LOGIN <Ionicons name="arrow-forward-outline" size={18} />
          </Text>
        </Pressable>

        {/* ALTERNATIVE */}
        <Text style={styles.alt}>ALTERNATIVE OPS</Text>

        <View style={styles.socials}>
          <View style={styles.socialBtn}>
            <Ionicons name="logo-github" size={18} color={Colors.textPrimary} />
            <Text style={styles.socialText}>GITHUB</Text>
          </View>

          <View style={styles.socialBtn}>
            <Ionicons name="logo-google" size={18} color={Colors.textPrimary} />
            <Text style={styles.socialText}>GOOGLE</Text>
          </View>
        </View>

        <Text style={styles.register}>
          New recruit?{" "}
          <Text
            style={styles.accent}
            onPress={() => router.push("/auth/register")}
          >
            REGISTER PERIMETER
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

  secure: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  sub: {
    marginTop: 8,
    color: Colors.textSecondary,
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

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  link: {
    color: Colors.primary,
    fontSize: 12,
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

  alt: {
    marginTop: 24,
    color: Colors.textSecondary,
    textAlign: "center",
    letterSpacing: 2,
    fontSize: 12,
  },

  socials: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },

  socialBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  socialText: {
    color: Colors.textPrimary,
  },

  register: {
    marginTop: 20,
    textAlign: "center",
    color: Colors.textSecondary,
  },
});
