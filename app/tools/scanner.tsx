import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Scanner() {
  const [url, setUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
const [sidebarOpen, setSidebarOpen] =
    useState(false);
    
  const handleScan = () => {
    if (!url) {
      Alert.alert("Missing Target", "Please enter a valid target URL.");
      return;
    }

    Alert.alert(
      "Scan Unavailable",
      "Scanning is not available in the mobile app. Please visit our website.",
      [{ text: "OK" }],
    );

    setUrl("");
  };
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
    <View style={styles.container}>
      <View style={styles.centerWrapper}>
        <View style={styles.terminalBox}>
          <View style={styles.iconWrapper}>
            <Ionicons name="scan-outline" size={28} color="#66FFDD" />
          </View>

          <Text style={styles.terminalTitle}>
            SECURITY <Text style={styles.accent}>TERMINAL</Text>
          </Text>

          <Text style={styles.terminalSub}>
            Deploy Black Cat probe to analyze remote target vulnerabilities.
          </Text>

          <TextInput
            placeholder="https://target-domain.com"
            placeholderTextColor="#888"
            value={url}
            onChangeText={setUrl}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[
              styles.terminalInput,
              isFocused && styles.terminalInputFocused,
            ]}
          />

          <Pressable style={styles.scanButton} onPress={handleScan}>
            <Text style={styles.scanButtonText}>SCAN TARGET</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/tools/dashboard")}
            style={({ pressed }) => [
              styles.dashboardButton,
              pressed && styles.dashboardButtonPressed,
            ]}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.dashboardButtonText,
                  pressed && styles.dashboardButtonTextPressed,
                ]}
              >
                GO TO DASHBOARD
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  terminalBox: {
    backgroundColor: "#0F1A2B",
    padding: 24,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#1d6b5cc2",
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#112B3C",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  terminalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  accent: {
    color: Colors.primary,
  },
  terminalSub: {
    color: "#9CA3AF",
    marginVertical: 15,
    textAlign: "center",
  },
  terminalInput: {
    backgroundColor: "#111C2E",
    padding: 15,
    borderRadius: 14,
    color: "#fff",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1E2A3A",
  },
  terminalInputFocused: {
    borderColor: "#23957e",
    shadowColor: "#07a485",
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButton: {
    backgroundColor: "#66FFDD",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  scanButtonText: {
    color: "#0F1A2B",
    fontWeight: "bold",
  },
  dashboardButton: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#23957e",
  },
  dashboardButtonPressed: {
    backgroundColor: "#23957e",
  },
  dashboardButtonText: {
    color: "#23957e",
    fontWeight: "600",
  },
  dashboardButtonTextPressed: {
    color: "#0F1A2B",
  },
});
