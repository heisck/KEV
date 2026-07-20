import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, waitFor } from '@testing-library/react-native';

import { EMPTY_WIZARD_VALUES } from '@/components/session/sessionForm';
import { useSessionDraft } from '@/hooks/useSessionDraft';

beforeEach(async () => AsyncStorage.clear());

it('restores a validated session wizard draft', async () => {
  await AsyncStorage.setItem(
    'session-draft:create',
    JSON.stringify({
      step: 2,
      values: { ...EMPTY_WIZARD_VALUES, building: 'Engineering Block' },
    }),
  );

  const { result } = renderHook(() => useSessionDraft('session-draft:create'));

  await waitFor(() => expect(result.current.ready).toBe(true));
  expect(result.current.draft?.step).toBe(2);
  expect(result.current.draft?.values.building).toBe('Engineering Block');
});
