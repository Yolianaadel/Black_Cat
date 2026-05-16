import { Colors } from "@/constants/colors";
import { Ionicons , MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, Line, RadialGradient, Rect, Stop } from "react-native-svg";

import {
  createSession,
  deleteSessionById,
  getAllSessions,
  getSessionMessages,
  sendChatMessage,
} from "../services/chatService";

const { width, height } = Dimensions.get("window");

/* ===========================
   Grid + Glow Background
=========================== */
const GRID = 40;
const COLS = Math.ceil(width / GRID) + 1;
const ROWS = Math.ceil(height / GRID) + 1;

const GridGlowBackground = () => {
  const hLines = Array.from({ length: ROWS }, (_, i) => i * GRID);
  const vLines = Array.from({ length: COLS }, (_, i) => i * GRID);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="glowLeft" cx="0%" cy="55%" r="55%">
            <Stop offset="0%" stopColor="#00ffcc" stopOpacity="0.14" />
            <Stop offset="100%" stopColor="#00ffcc" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="glowRight" cx="100%" cy="45%" r="55%">
            <Stop offset="0%" stopColor="#00ffcc" stopOpacity="0.10" />
            <Stop offset="100%" stopColor="#00ffcc" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="glowTop" cx="50%" cy="0%" r="40%">
            <Stop offset="0%" stopColor="#00ffcc" stopOpacity="0.07" />
            <Stop offset="100%" stopColor="#00ffcc" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {hLines.map((y) => (
          <Line
            key={`h${y}`}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke="#00ffcc"
            strokeWidth={0.4}
            strokeOpacity={0.08}
          />
        ))}
        {vLines.map((x) => (
          <Line
            key={`v${x}`}
            x1={x}
            y1={0}
            x2={x}
            y2={height}
            stroke="#00ffcc"
            strokeWidth={0.4}
            strokeOpacity={0.08}
          />
        ))}
        <Rect x={0} y={0} width={width} height={height} fill="url(#glowLeft)" />
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="url(#glowRight)"
        />
        <Rect x={0} y={0} width={width} height={height} fill="url(#glowTop)" />
      </Svg>
    </View>
  );
};

/* ===========================
  Types
=========================== */
type Session = { _id: string; title: string; lastMessage?: string };
type Message = { role: "user" | "assistant"; content: string };

/* ===========================
  Main Screen
=========================== */
export default function AssistantScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [token, setToken] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    loadToken();
  }, []);
  useEffect(() => {
    if (token) loadSessions();
  }, [token]);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("access_token");
      if (!storedToken) {
        setIsAuthenticated(false);
        return;
      }
      setToken(storedToken);
      setIsAuthenticated(true);
    } catch (e) {
      console.log("TOKEN ERROR:", e);
    }
  };

  const loadSessions = async () => {
    try {
      const res = await getAllSessions(token);
      setSessions(res?.data || []);
    } catch (e) {
      console.log("LOAD SESSIONS ERROR:", e);
    }
  };

  const handleNewChat = async () => {
    try {
      const data = await createSession(token);
      const newId =
        data?.data?._id || data?.id || data?._id || data?.sessionId || "";
      setSessions((prev) => [{ _id: newId, title: "New Chat" }, ...prev]);
      setSessionId(newId);
      setActiveSessionId(newId);
      setMessages([]);
      setSidebarOpen(false);
    } catch (e) {
      console.log("NEW CHAT ERROR:", e);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        const data = await createSession(token);
        currentSessionId =
          data?.data?._id || data?.id || data?._id || data?.sessionId || "";
        setSessions((prev) => [
          { _id: currentSessionId, title: "New Chat" },
          ...prev,
        ]);
        setSessionId(currentSessionId);
        setActiveSessionId(currentSessionId);
      } catch (e) {
        console.log("SESSION CREATE ERROR:", e);
        return;
      }
    }
    const userText = message.trim();
    const sessionTitle =
      userText.length > 28 ? userText.slice(0, 28) + "..." : userText;
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setMessage("");
    setLoading(true);
    try {
      await sendChatMessage(currentSessionId, userText, token);
      setSessions((prev) =>
        prev.map((s) =>
          s._id === currentSessionId
            ? { ...s, title: s.title === "New Chat" ? sessionTitle : s.title }
            : s,
        ),
      );
      const res = await getSessionMessages(currentSessionId, token);
      const chatMessages = res?.data || [];
      setMessages(
        chatMessages.map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      );
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    } catch (e) {
      console.log("SEND ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (session: Session) => {
    try {
      setActiveSessionId(session._id);
      setSessionId(session._id);
      const res = await getSessionMessages(session._id, token);
      const chatMessages = res?.data || [];
      setMessages(
        chatMessages.map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      );
      setSidebarOpen(false);
    } catch (e) {
      console.log("SELECT SESSION ERROR:", e);
    }
  };

  const handleDeleteSession = (session: Session) => {
    Alert.alert(
      "Delete Chat",
      `Delete "${session.title?.trim() || "New Chat"}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(session._id);
              await deleteSessionById(session._id, token);
              setSessions((prev) => prev.filter((s) => s._id !== session._id));
              if (session._id === sessionId) {
                setMessages([]);
                setSessionId("");
                setActiveSessionId("");
              }
            } catch {
              Alert.alert("Error", "Could not delete chat. Please try again.");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  if (isAuthenticated === false) {
    return (
      <View style={styles.emptyContainer}>
        <GridGlowBackground />
        <Text style={styles.emptyText}>You should register or login first</Text>
        <Pressable
          style={styles.loginButton}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.loginText}>Go to Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <GridGlowBackground />

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
          <Pressable
            style={styles.closeBtn}
            onPress={() => setSidebarOpen(false)}
          >
            <Ionicons name="close" size={20} color="#94A3B8" />
          </Pressable>

          {/* AI Card */}
          <View style={styles.aiCard}>
            <View style={styles.aiCardIcon}>
              <MaterialCommunityIcons
                name="robot-outline"
                size={18}
                color={Colors.textPrimary}
              />
            </View>
            <View>
              <Text style={styles.aiTitle}>AI Assistant</Text>
              <Text style={styles.aiSubtitle}>Black Cat Security AI</Text>
            </View>
          </View>

          {/* New Chat */}
          <Pressable style={styles.newChatButton} onPress={handleNewChat}>
            <Ionicons name="add" size={20} color="#001E18" />
            <Text style={styles.newChatText}>New Chat</Text>
          </Pressable>

          {/* History */}
          <View style={styles.historyHeaderRow}>
            <Text style={styles.historyTitle}>HISTORY CHATS</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{sessions.length}</Text>
            </View>
          </View>

          {sessions.length === 0 && (
            <Text style={styles.noChatsText}>No chats yet</Text>
          )}

          <FlatList
            data={sessions}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator
            indicatorStyle="white"
            style={{ flex: 1 }}
            renderItem={({ item: session }) => (
              <Pressable
                style={[
                  styles.sessionItem,
                  activeSessionId === session._id && styles.sessionItemActive,
                ]}
                onPress={() => handleSelectSession(session)}
              >
                <View style={styles.sessionLeft}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={16}
                    color="#64748B"
                  />
                  <Text numberOfLines={1} style={styles.sessionText}>
                    {session.title?.trim() || "New Chat"}
                  </Text>
                </View>
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteSession(session)}
                  disabled={deletingId === session._id}
                >
                  {deletingId === session._id ? (
                    <ActivityIndicator size="small" color="#F87171" />
                  ) : (
                    <Ionicons name="trash-outline" size={16} color="#F87171" />
                  )}
                </Pressable>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* ── ACTION ROW ── */}
      <View style={styles.actionRow}>
        <Pressable
          style={styles.menuSquareBtn}
          onPress={() => {
            loadSessions();
            setSidebarOpen(true);
          }}
        >
          <Ionicons name="menu" size={20} color="#E2E8F0" />
        </Pressable>
        <Pressable style={styles.backHomeBtn} onPress={() => router.push("/")}>
          <Ionicons name="home-outline" size={15} color={Colors.primary} />
          <Text style={styles.backHomeTxt}>Back to Home Page</Text>
        </Pressable>
      </View>

      {/* ── CHAT CARD ── */}
      <View style={styles.chatCard}>
        <View style={styles.cardHeader}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={12} color="#00ffcc" />
            <Text style={styles.badgeTxt}>Black Cat AI</Text>
          </View>
          <Text style={styles.cardTitle}>Black Cat Chatbot</Text>
          <Text style={styles.cardSubtitle}>
            Ask about vulnerabilities, scan results, and security concepts.
          </Text>
        </View>

        <View style={styles.divider} />

        {messages.length === 0 && !loading ? (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>
              Start a new chat and ask anything about security.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageWrapper,
                  item.role === "user" ? styles.userWrapper : styles.aiWrapper,
                ]}
              >
                <View
                  style={[
                    styles.avatar,
                    item.role === "user" ? styles.userAvatar : styles.aiAvatar,
                  ]}
                >
                  <Ionicons
                    name={
                      item.role === "user"
                        ? "person-outline"
                        : "sparkles-outline"
                    }
                    size={13}
                    color={item.role === "user" ? "#001E18" : "#00ffcc"}
                  />
                </View>
                <View
                  style={[
                    styles.messageBubble,
                    item.role === "user" ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      item.role === "user" && { color: "#001E18" },
                    ]}
                  >
                    {item.content}
                  </Text>
                </View>
              </View>
            )}
          />
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#00ffcc" size="small" />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}

        <View style={styles.scrollBar} />
      </View>

      {/* ── INPUT ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ask about vulnerabilities..."
            placeholderTextColor="#374151"
            style={styles.input}
            multiline
            onSubmitEditing={handleSend}
          />
          <Pressable style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={18} color="#001E18" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ===========================
   Styles
=========================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060d1a",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  backdrop: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 20,
  },

  /* ── Sidebar ── */
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.78,
    backgroundColor: "#070f1c",
    zIndex: 30,
    paddingTop: Platform.OS === "ios" ? 54 : 40,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderRightWidth: 1,
    borderRightColor: "rgba(0,255,204,0.08)",
  },
  closeBtn: {
  alignSelf: "flex-end",

  width: 38,
  height: 38,
  borderRadius: 12,

  backgroundColor: "rgba(255,255,255,0.05)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.07)",

  justifyContent: "center",
  alignItems: "center",

  marginTop: 60,
  marginBottom: 16,
},
  
  aiCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0d1829",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  aiCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "rgba(0,255,204,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,255,204,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  aiTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  aiSubtitle: { color: "#64748B", fontSize: 12, marginTop: 2 },
  newChatButton: {
    backgroundColor: "#00ffcc",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  newChatText: { color: "#001E18", fontWeight: "800", fontSize: 15 },
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTitle: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2.5,
  },
  countBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,255,204,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,255,204,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  countText: { color: "#00ffcc", fontWeight: "800", fontSize: 12 },
  noChatsText: {
    color: "#475569",
    textAlign: "center",
    marginTop: 20,
    fontSize: 13,
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0d1829",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  sessionItemActive: {
    borderColor: "rgba(0,255,204,0.25)",
    backgroundColor: "rgba(0,255,204,0.05)",
  },
  sessionLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10 },
  sessionText: { color: "#CBD5E1", fontSize: 14, flex: 1 },
  deleteBtn: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── Top Nav ── */
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,255,204,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,255,204,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  brandName: {
    color: "#00ffcc",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2.5,
  },
  topNavRight: { flexDirection: "row", gap: 8 },
  topNavIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── Action Row ── */
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    paddingTop: 28,
  },
  menuSquareBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  backHomeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  backHomeTxt: { color: "#CBD5E1", fontSize: 14, fontWeight: "500" },

  /* ── Chat Card ── */
  chatCard: {
    flex: 1,
    marginHorizontal: 10,
    marginBottom: 0,
    backgroundColor: "#080f1e",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
    position: "relative",
  },
  cardHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,255,204,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,255,204,0.2)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  badgeTxt: { color: "#00ffcc", fontSize: 12, fontWeight: "700" },
  cardTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  cardSubtitle: { color: "#475569", fontSize: 13, lineHeight: 19 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.04)" },
  scrollBar: {
    position: "absolute",
    right: 3,
    top: "30%",
    bottom: "8%",
    width: 4,
    borderRadius: 4,
    backgroundColor: "#00ffcc",
    opacity: 0.6,
  },

  /* Messages */
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyChatText: {
    color: "#374151",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
  },
  messagesContainer: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    maxWidth: "90%",
  },
  userWrapper: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  aiWrapper: { alignSelf: "flex-start" },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatar: { backgroundColor: "#00ffcc" },
  aiAvatar: {
    backgroundColor: "#0d1829",
    borderWidth: 1,
    borderColor: "rgba(0,255,204,0.15)",
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: { backgroundColor: "#00ffcc" },
  aiBubble: {
    backgroundColor: "#0d1829",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  messageText: { color: "#CBD5E1", lineHeight: 20, fontSize: 14 },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  loadingText: { color: "#475569", fontSize: 13 },

  /* ── Input ── */
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 110,
    backgroundColor: "#0a1525",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    color: "#fff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  sendBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#00ffcc",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Auth */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#060d1a",
    paddingHorizontal: 20,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    fontSize: 15,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#00ffcc",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginText: { color: "#000", fontWeight: "bold", fontSize: 16 },
});
