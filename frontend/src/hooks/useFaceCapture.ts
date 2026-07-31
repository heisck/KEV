import type { CameraView } from 'expo-camera';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useCallback, useRef, useState } from 'react';

import { identifyFace } from '@/api/verify';
import { getProblemDetail } from '@/api/schemas';
import type { FaceIdentifyResponse } from '@/api/schemas';
import { haptic } from '@/lib/haptics';
import { logger } from '@/lib/logger';

/**
 * Capture lifecycle. Each step is surfaced to the invigilator: a face scan takes long
 * enough that silence reads as a frozen app, and the shutter must lock immediately so a
 * second tap cannot enqueue a duplicate check-in.
 */
export type CapturePhase = 'idle' | 'captured' | 'verifying' | 'matched' | 'rejected';

export type FaceCaptureState = {
  phase: CapturePhase;
  result: FaceIdentifyResponse | null;
  error: string | null;
  /** True from shutter press until the flow resets — drives the disabled shutter. */
  busy: boolean;
};

const IDLE: FaceCaptureState = { phase: 'idle', result: null, error: null, busy: false };

/**
 * Longest edge of the uploaded probe. A raw camera frame is several megabytes, which
 * dominates round-trip time on a slow link and buys no accuracy — the face detector
 * works from a fraction of that. 720px keeps detail well past what recognition needs.
 */
const PROBE_MAX_EDGE = 720;
const PROBE_COMPRESSION = 0.7;

/** Downscale and re-encode a captured frame before upload. */
async function shrinkProbe(uri: string): Promise<string> {
  const rendered = await ImageManipulator.manipulate(uri)
    .resize({ width: PROBE_MAX_EDGE })
    .renderAsync();
  const saved = await rendered.saveAsync({
    compress: PROBE_COMPRESSION,
    format: SaveFormat.JPEG,
  });
  return saved.uri;
}

export function useFaceCapture(sessionId: string, onMatched: (r: FaceIdentifyResponse) => void) {
  const cameraRef = useRef<CameraView>(null);
  const [state, setState] = useState<FaceCaptureState>(IDLE);

  const reset = useCallback(() => setState(IDLE), []);

  const capture = useCallback(async () => {
    // Guard here rather than only on the button: a rapid double-tap can fire twice
    // before React re-renders the disabled state.
    if (state.busy) return;
    setState({ phase: 'captured', result: null, error: null, busy: true });
    haptic('select');

    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.6 });
      if (!photo?.uri) {
        setState({
          phase: 'rejected',
          result: null,
          error: 'Could not capture. Try again.',
          busy: false,
        });
        haptic('error');
        return;
      }

      setState((prev) => ({ ...prev, phase: 'verifying' }));
      const probeUri = await shrinkProbe(photo.uri);
      const result = await identifyFace(sessionId, {
        uri: probeUri,
        name: 'probe.jpg',
        type: 'image/jpeg',
      });

      if (!result.match) {
        setState({
          phase: 'rejected',
          result,
          error: result.detail ?? 'No match found.',
          busy: false,
        });
        haptic('error');
        return;
      }

      setState({ phase: 'matched', result, error: null, busy: false });
      haptic('success');
      onMatched(result);
    } catch (err) {
      // A 422 means the capture itself was unusable (no face / too blurry). Its detail
      // is written for the invigilator, so surface it instead of a generic failure.
      const detail = getProblemDetail(err)?.detail;
      logger.warn('face identify failed', { sessionId, detail });
      setState({
        phase: 'rejected',
        result: null,
        error: detail ?? 'Verification failed. Try again.',
        busy: false,
      });
      haptic('error');
    }
  }, [onMatched, sessionId, state.busy]);

  return { cameraRef, ...state, capture, reset };
}
