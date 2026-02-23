import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/colors';
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  onMenuPress: () => void;
};

export default function Header({ onMenuPress }: Props) {
  return (
<View style={styles.container}>
  <View style={styles.logoRow}>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
  <MaterialCommunityIcons name="shield-outline" size={26} color="#00ffcc" />
  <MaterialCommunityIcons name="cat" size={20} color="#00ffcc" style={{ marginLeft: -18 }} />
</View>

    <Text style={styles.logo}>
      BLACK<Text style={styles.accent}>CAT</Text>
    </Text>
  </View>

  <Pressable onPress={onMenuPress}>
    <Text style={styles.menu}>≡</Text>
  </Pressable>
</View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',   // ✅ ثابت
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },

  logoRow: {
  flexDirection: "row",
  alignItems: "center",
},
  logo: {
    color: Colors.textPrimary,
    fontSize: 25,
    fontWeight: 'bold',
  },
  accent: {
    color: Colors.primary,
  },
  menu: {
    color: Colors.textPrimary,
    fontSize: 32,
  },
});
