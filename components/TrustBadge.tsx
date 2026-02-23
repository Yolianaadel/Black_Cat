import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export default function TrustBadge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    margin: 6,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
