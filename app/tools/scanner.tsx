import { Colors } from "@/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function Scanner() {
  const [url, setUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

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

  const navItems = [
    { label: "Reports", icon: "grid-outline", route: "/scan/report" },
    { label: "Scan History", icon: "time-outline", route: "/scan/history" },
    { label: "Home", icon: "home-outline", route: "/" },
  ];

  return (
    <View style={{ flex: 1 }}>

      {/* BACKDROP */}
      {sidebarOpen && (
        <Pressable
          style={styles.backdrop}
          onPress={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      {sidebarOpen && (
        <View style={styles.sidebar}>

          {/* Close */}
          <Pressable style={styles.closeBtn} onPress={() => setSidebarOpen(false)}>
            <Ionicons name="close" size={20} color="#94A3B8" />
          </Pressable>

          {/* Header Card */}
          <View style={styles.aiCard}>
            <View style={styles.aiCardIcon}>
              <Ionicons name="scan-outline" size={18} color="#00ffcc" />
            </View>
            <View>
              <Text style={styles.aiTitle}>Scanner</Text>
              <Text style={styles.aiSubtitle}>Black Cat Security</Text>
            </View>
          </View>

          {/* Nav Items */}
          <View style={styles.historyHeaderRow}>
            <Text style={styles.historyTitle}>NAVIGATE</Text>
          </View>

          {navItems.map((item) => (
            <Pressable
              key={item.route}
              style={styles.sessionItem}
              onPress={() => {
                setSidebarOpen(false);
                router.push(item.route as any);
              }}
            >
              <View style={styles.sessionLeft}>
                <Ionicons name={item.icon as any} size={16} color="#64748B" />
                <Text style={styles.sessionText}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#475569" />
            </Pressable>
          ))}

        </View>
      )}

      {/* ── MAIN CONTENT ── */}
      <View style={styles.container}>

        {/* Menu Button */}
        <View style={styles.menuContainer}>
          <Pressable
            style={styles.menuBtn}
            onPress={() => setSidebarOpen(true)}
          >
            <Ionicons name="menu" size={22} color="#E2E8F0" />
          </Pressable>
        </View>

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

  /* Menu Button */
  menuContainer: {
    paddingTop: 80,
    paddingLeft: 16,
  },
  menuBtn: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "center", alignItems: "center",
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
    width: 70, height: 70, borderRadius: 20,
    backgroundColor: "#112B3C",
    alignItems: "center", justifyContent: "center",
    alignSelf: "center", marginBottom: 20,
  },
  terminalTitle: {
    color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center",
  },
  accent: { color: Colors.primary },
  terminalSub: {
    color: "#9CA3AF", marginVertical: 15, textAlign: "center",
  },
  terminalInput: {
    backgroundColor: "#111C2E", padding: 15, borderRadius: 14,
    color: "#fff", marginBottom: 18, borderWidth: 1, borderColor: "#1E2A3A",
  },
  terminalInputFocused: {
    borderColor: "#23957e", shadowColor: "#07a485",
    shadowOpacity: 0.8, shadowRadius: 8, elevation: 6,
  },
  scanButton: {
    backgroundColor: "#66FFDD", paddingVertical: 16,
    borderRadius: 18, alignItems: "center",
  },
  scanButtonText: { color: "#0F1A2B", fontWeight: "bold" },
  dashboardButton: {
    marginTop: 14, paddingVertical: 14, borderRadius: 18,
    alignItems: "center", borderWidth: 1.5, borderColor: "#23957e",
  },
  dashboardButtonPressed: { backgroundColor: "#23957e" },
  dashboardButtonText: { color: "#23957e", fontWeight: "600" },
  dashboardButtonTextPressed: { color: "#0F1A2B" },

  /* ── Sidebar ── */
  backdrop: {
    position: "absolute", width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)", zIndex: 20,
  },
  sidebar: {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
    width: width * 0.78,
    backgroundColor: "#070f1c",
    zIndex: 30,
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderRightWidth: 1,
    borderRightColor: "rgba(0,255,204,0.08)",
  },
  closeBtn: {
    alignSelf: "flex-end",
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    justifyContent: "center", alignItems: "center",
    marginTop: 60, marginBottom: 16,
  },
  aiCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#0d1829",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 18, paddingVertical: 14, paddingHorizontal: 14,
    marginBottom: 14,
  },
  aiCardIcon: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: "rgba(0,255,204,0.08)",
    borderWidth: 1, borderColor: "rgba(0,255,204,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  aiTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  aiSubtitle: { color: "#64748B", fontSize: 12, marginTop: 2 },
  historyHeaderRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12, marginTop: 4,
  },
  historyTitle: {
    color: "#475569", fontSize: 11, fontWeight: "800", letterSpacing: 2.5,
  },
  sessionItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#0d1829", borderRadius: 14,
    paddingVertical: 13, paddingHorizontal: 14, marginBottom: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
  },
  sessionLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10 },
  sessionText: { color: "#CBD5E1", fontSize: 14, flex: 1 },
});