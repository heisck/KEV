import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder shell entry. Feature screens (Room Setup, etc.) are built in a later phase.
export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>KEV</Text>
        <Text style={styles.subtitle}>Project scaffold ready.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  title: { fontSize: 32, fontWeight: '700' },
  subtitle: { fontSize: 14, opacity: 0.6, textAlign: 'center' },
});
