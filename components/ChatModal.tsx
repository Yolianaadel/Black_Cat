import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/* ===========================
  Pulsing Dots Component
=========================== */
const PulsingDots = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createAnimation = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
        ]),
      );

    Animated.parallel([
      createAnimation(dot1, 0),
      createAnimation(dot2, 200),
      createAnimation(dot3, 400),
    ]).start();
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
};
type Message = {
  id: string;
  text: string;
  fromBot: boolean;
  isLoading?: boolean; // 👈 مهمة جدًا
};

/* ===========================
   Chat Modal
=========================== */
export default function ChatModal({ onClose }: any) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "👋 Hello! How can I help you?", fromBot: true },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const flatListRef = useRef<any>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeChat = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: message,
      fromBot: false,
    };

    const loadingId = Date.now().toString() + "_loading";

    const loadingMessage = {
      id: loadingId,
      text: "",
      fromBot: true,
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setMessage("");

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                text: "Processing data securely...",
                isLoading: false,
              }
            : msg,
        ),
      );
    }, 2500);
  };

  // Auto scroll
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.wrapper}
      >
        <Animated.View
          style={[
            styles.chatBox,
            {
              opacity,
              transform: [{ scale: scaleAnim }, { translateY }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>BlackCat Assistant</Text>
            <Pressable onPress={closeChat}>
              <Ionicons name="close" size={20} color="#fff" />
            </Pressable>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            renderItem={({ item }) => (
              <View
                style={
                  item.isLoading
                    ? styles.loadingWrapper
                    : [
                        styles.messageBubble,
                        item.fromBot ? styles.botBubble : styles.userBubble,
                      ]
                }
              >
                {item.isLoading ? (
                  <PulsingDots />
                ) : (
                  <Text style={{ color: item.fromBot ? "#000" : "#fff" }}>
                    {item.text}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Loading */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <PulsingDots />
            </View>
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#666"
              style={styles.input}
            />
            <Pressable onPress={sendMessage}>
              <Ionicons name="send" size={22} color="#66FFDD" />
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ===========================
   Styles
=========================== */
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },

  wrapper: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingRight: 20,
    paddingBottom: 100,
  },

  chatBox: {
    width: 320,
    height: 450,
    backgroundColor: "#0F1A2B",
    borderRadius: 22,
    padding: 16,
    shadowColor: "#00ffcc",
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: {
    color: "#66FFDD",
    fontWeight: "bold",
    fontSize: 15,
  },

  messageBubble: {
    padding: 10,
    borderRadius: 14,
    marginVertical: 5,
    maxWidth: "80%",
  },

  botBubble: {
    backgroundColor: "#66FFDD",
    alignSelf: "flex-start",
  },

  userBubble: {
    backgroundColor: "#1E2A3A",
    alignSelf: "flex-end",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1E2A3A",
    paddingTop: 10,
  },

  input: {
    flex: 1,
    color: "#fff",
  },

dot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: "#00ffcc",
  shadowColor: "#00ffcc",
  shadowOpacity: 0.8,
  shadowRadius: 6,
  elevation: 5,
},

  loadingContainer: {
    alignSelf: "flex-start",
    marginVertical: 8,
    paddingLeft: 6,
    opacity: 0.8,
  },
  loadingWrapper: {
    alignSelf: "flex-start",
    marginVertical: 8,
    paddingLeft: 6,
  },
});
