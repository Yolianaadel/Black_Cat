import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = {
  value: string;
  label: string;
};

export default function StatItem({ value, label }: Props) {
  return (
    <View style={styles.item}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    marginBottom: 40,
  },

  value: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.primary,

    // ✨ Glow effect
    textShadowColor: Colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  label: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
