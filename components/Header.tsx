import { Colors } from "@/constants/colors";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onMenuPress: () => void;
};

export default function Header({ onMenuPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Image
          source={require("../assets/images/logoo.png")}
          style={styles.logoImage}
        />

        <Text style={styles.logoText}>BLACK CAT</Text>
      </View>

      <Pressable onPress={onMenuPress}>
        <Text style={styles.menu}>≡</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute", // ✅ ثابت
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    borderRadius: 20,
  },

  logoText: {
    color: Colors.primary,
    textShadowColor: Colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 5,
  },
  logo: {
    color: Colors.textPrimary,
    fontSize: 25,
    fontWeight: "bold",
  },
  accent: {
    color: Colors.primary,
  },
  menu: {
    color: Colors.textPrimary,
    fontSize: 32,
  },
});
