import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { FaceIdentifyResponse } from '@/api/schemas';
import { useFaceCapture } from '@/hooks/useFaceCapture';

const mockIdentifyFace = jest.fn();
const takePictureAsync = jest.fn();

jest.mock('@/api/verify', () => ({
  identifyFace: (...args: unknown[]) => mockIdentifyFace(...args),
}));

jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  ImageManipulator: {
    manipulate: () => ({
      resize: () => ({
        renderAsync: async () => ({ saveAsync: async () => ({ uri: 'file://probe.jpg' }) }),
      }),
    }),
  },
}));

const MATCH: FaceIdentifyResponse = {
  match: true,
  student: {
    id: 7,
    indexNumber: '4211020',
    fullName: 'Ama Boateng',
    programme: 'BSc Computer Science',
    level: 300,
    photoUrl: 'https://example.test/photo.jpg',
    enrolled: true,
    feesStatus: 'PAID',
    eligible: true,
    courses: ['CS 301'],
  },
  similarity: 0.82,
  margin: 0.2,
  rosterSize: 40,
  detail: null,
};

/** Render the hook with a stubbed camera attached to its ref. */
function renderCapture(onMatched = jest.fn()) {
  const hook = renderHook(() => useFaceCapture('42', onMatched));
  // @ts-expect-error — the test stands in a minimal stub for the native CameraView.
  hook.result.current.cameraRef.current = { takePictureAsync };
  return hook;
}

beforeEach(() => {
  jest.useFakeTimers();
  takePictureAsync.mockReset().mockResolvedValue({ uri: 'file://shot.jpg' });
  mockIdentifyFace.mockReset().mockResolvedValue(MATCH);
});

afterEach(() => {
  jest.useRealTimers();
});

/** The whole point: everything after the shutter runs off the saved file. */
it('freezes the captured frame before verification starts so the phone can be lowered', async () => {
  let release: (value: FaceIdentifyResponse) => void = () => {};
  mockIdentifyFace.mockReturnValue(
    new Promise<FaceIdentifyResponse>((resolve) => {
      release = resolve;
    }),
  );
  const { result } = renderCapture();

  act(() => void result.current.capture());

  await waitFor(() => expect(result.current.photoUri).toBe('file://shot.jpg'));
  expect(result.current.phase).toBe('verifying');
  expect(takePictureAsync).toHaveBeenCalledTimes(1);

  await act(async () => release(MATCH));
  expect(result.current.phase).toBe('matched');
});

it('re-arms the shutter after the match hold so the next student can be captured', async () => {
  const onMatched = jest.fn();
  const { result } = renderCapture(onMatched);

  await act(async () => await result.current.capture());
  expect(onMatched).toHaveBeenCalledWith(MATCH);
  expect(result.current.busy).toBe(true);

  act(() => jest.runOnlyPendingTimers());
  expect(result.current.phase).toBe('idle');
  expect(result.current.busy).toBe(false);
  expect(result.current.photoUri).toBeNull();
});

it('keeps the rejected shot on screen with its reason', async () => {
  mockIdentifyFace.mockResolvedValue({ ...MATCH, match: false, detail: 'No match found.' });
  const { result } = renderCapture();

  await act(async () => await result.current.capture());

  expect(result.current.phase).toBe('rejected');
  expect(result.current.error).toBe('No match found.');
  expect(result.current.photoUri).toBe('file://shot.jpg');
  expect(result.current.busy).toBe(false);
});

it('ignores a second shutter press while a capture is in flight', async () => {
  const { result } = renderCapture();

  await act(async () => {
    await Promise.all([result.current.capture(), result.current.capture()]);
  });

  expect(takePictureAsync).toHaveBeenCalledTimes(1);
});
