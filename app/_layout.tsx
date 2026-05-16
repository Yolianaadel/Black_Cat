import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useState } from "react";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import { Colors } from "../constants/colors";
import { useFCM } from "../hooks/useFCM";

// import { usePathname } from "expo-router";
// import { Pressable } from "react-native";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import ChatModal from "@/components/ChatModal";

export default function RootLayout() {
  useFCM(1); // مؤقت

  const [menuOpen, setMenuOpen] = useState(false);

  // const [chatOpen, setChatOpen] = useState(false);
  // const pathname = usePathname();

  return (
    <View style={styles.container}>
      <Header
        onMenuPress={() => {
          // setChatOpen(false);
          setMenuOpen(true);
        }}
      />

      <Stack screenOptions={{ headerShown: false }} />

      {menuOpen && (
        <SideMenu
          onClose={() => setMenuOpen(false)}
        />
      )}

      {/*
      {chatOpen && (
        <ChatModal onClose={() => setChatOpen(false)} />
      )}

      {!menuOpen && pathname !== "/ai/assistant" && (
        <Pressable
          style={styles.fab}
          onPress={() => setChatOpen((prev) => !prev)}
        >
          <MaterialCommunityIcons
            name="robot-outline"
            size={24}
            color="#00231A"
          />
        </Pressable>
      )}
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /*
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#66FFDD",
    justifyContent: "center",
    alignItems: "center",
    elevation: 12,
    shadowColor: "#00ffcc",
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  */
});