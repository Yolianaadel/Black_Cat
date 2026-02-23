import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export default function PrimaryButton({ title }: { title: string }) {
  return (
    <TouchableOpacity style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  text: {
    color: '#00231A',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
