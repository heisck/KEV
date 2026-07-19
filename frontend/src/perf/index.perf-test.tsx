import { SafeAreaProvider } from 'react-native-safe-area-context';
import { measureRenders } from 'reassure';

import { HomeScreen as Index } from '@/screens/kev/HomeScreen';

// Reassure perf regression test. Run with `npm run perf` (not part of the jest suite).
if (typeof test === 'function') {
  test('Index render performance', async () => {
    await measureRenders(<Index />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <SafeAreaProvider>{children}</SafeAreaProvider>
      ),
    });
  });
}
