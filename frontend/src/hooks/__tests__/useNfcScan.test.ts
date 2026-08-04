import { act, renderHook, waitFor } from '@testing-library/react-native';
import NfcManager from 'react-native-nfc-manager';
import { useNfcScan } from '@/hooks/useNfcScan';

const nfc = NfcManager as unknown as {
  start: jest.Mock;
  isSupported: jest.Mock;
  requestTechnology: jest.Mock;
  getTag: jest.Mock;
  cancelTechnologyRequest: jest.Mock;
};

describe('useNfcScan', () => {
  beforeEach(() => {
    nfc.start.mockResolvedValue(undefined);
    nfc.isSupported.mockResolvedValue(true);
    nfc.requestTechnology.mockResolvedValue(undefined);
    nfc.getTag.mockResolvedValue(null);
    nfc.cancelTechnologyRequest.mockResolvedValue(undefined);
  });

  it('reports unsupported when the device has no NFC', async () => {
    nfc.isSupported.mockResolvedValue(false);
    const { result } = renderHook(() => useNfcScan({ onNfcUid: jest.fn() }));

    act(() => result.current.start());

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('unsupported');
  });

  it('delivers the normalized hardware UID from the tag', async () => {
    nfc.getTag.mockResolvedValue({ id: '04:AB-12 9F' });
    const onNfcUid = jest.fn();
    const { result } = renderHook(() => useNfcScan({ onNfcUid }));

    act(() => result.current.start());

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(onNfcUid).toHaveBeenCalledWith('04ab129f');
    expect(result.current.error).toBeNull();
    expect(nfc.cancelTechnologyRequest).toHaveBeenCalled();
  });

  it('maps a cancelled pending scan to the cancelled error', async () => {
    let rejectRequest: ((e: Error) => void) | undefined;
    nfc.requestTechnology.mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectRequest = reject;
        }),
    );
    nfc.cancelTechnologyRequest.mockImplementation(async () => {
      rejectRequest?.(new Error('cancelled'));
      rejectRequest = undefined;
    });
    const onNfcUid = jest.fn();
    const { result } = renderHook(() => useNfcScan({ onNfcUid }));

    act(() => result.current.start());
    await waitFor(() => expect(result.current.status).toBe('scanning'));

    act(() => result.current.cancel());

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('cancelled');
    expect(onNfcUid).not.toHaveBeenCalled();

    act(() => result.current.reset());
    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
  });
});
