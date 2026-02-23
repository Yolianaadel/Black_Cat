import { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

type Props = {
  Icon: ReactNode;
  title: string;
  desc: string;
};

export default function FeatureCard({ Icon, title, desc }: Props) {
  return (
    <View style={styles.card}>
      
      <View style={styles.iconBox}>
        {Icon}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{desc}</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0F1C2E", 
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },

  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: "#43debd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 6,
  },

  desc: {
    color: "#A6B0C3", // أفتح شوية من الرمادي القديم
    fontSize: 14.5,
    lineHeight: 21,
  },
});