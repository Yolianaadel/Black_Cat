import { Colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";
import PrimaryButton from "./PrimaryButton";

export default function CallToAction() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>Ready to secure{"\n"}your future?</Text>

        <Text style={styles.desc}>
          Join 50,000+ developers protecting their applications with the most
          advanced security scanner on the market.
        </Text>

        <View style={styles.createBtn}>
          <PrimaryButton title="Create Account Now" />
        </View>
        <View style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Contact Sales</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 80,
    alignItems: "center",
  },

  card: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 36,
  },

  desc: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 25,
    lineHeight: 22,
  },

  secondaryBtn: {
    marginTop: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 40,
  },

  secondaryText: {
    color: Colors.textPrimary,
    fontSize: 15,
  },

  createBtn: {
    width: "88%",
    padding: 10,
  },
});
