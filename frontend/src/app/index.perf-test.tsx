import { SafeAreaProvider } from 'react-native-safe-area-context';
import { measureRenders } from 'reassure';
import Index from './index';

// Reassure perf regression test. Run with `npm run perf` (not part of the jest suite).
if (typeof test === 'function') {
  test('Index render performance', async () => {
    await measureRenders(<Index />, {
      wrapper: ({ children }) => <SafeAreaProvider>{children}</SafeAreaProvider>,
    });
  });
}
