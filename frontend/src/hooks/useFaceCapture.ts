import type { CameraView } from 'expo-camera';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  /**
   * Local uri of the frame under review. Everything after the shutter runs off this
   * file, so showing it is what tells the invigilator the phone can leave the face.
   */
  photoUri: string | null;
};

const IDLE: FaceCaptureState = { phase: 'idle', result: null, error: null, photoUri: null };

/** Phases that own the shutter. Deriving this keeps it from drifting out of step. */
function isBusy(phase: CapturePhase): boolean {
  return phase === 'captured' || phase === 'verifying' || phase === 'matched';
}

/** How long a match stays on screen before the shutter re-arms for the next student. */
const MATCH_HOLD_MS = 1200;

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
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Authoritative shutter lock. Rendered state can't serve here: a double-tap fires
  // both handlers off the same closure, before React has re-rendered the phase.
  const busyRef = useRef(false);
  const [state, setState] = useState<FaceCaptureState>(IDLE);

  const clearHold = useCallback(() => {
    if (holdRef.current) clearTimeout(holdRef.current);
    holdRef.current = null;
  }, []);

  useEffect(() => clearHold, [clearHold]);

  /** Land on a terminal phase and release the shutter. */
  const release = useCallback((next: (prev: FaceCaptureState) => FaceCaptureState) => {
    busyRef.current = false;
    setState(next);
  }, []);

  // The rejected shot stays on screen under the error: the invigilator needs to see
  // what the camera actually got to know whether to reframe or just retry.
  const reject = useCallback(
    (error: string, result: FaceIdentifyResponse | null = null) => {
      release((prev) => ({ ...prev, phase: 'rejected', result, error }));
      haptic('error');
    },
    [release],
  );

  const capture = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    clearHold();
    setState({ phase: 'captured', result: null, error: null, photoUri: null });
    haptic('select');

    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.6 });
      if (!photo?.uri) return reject('Could not capture. Try again.');

      // Frame is on disk — freeze it in the preview and release the camera.
      setState((prev) => ({ ...prev, photoUri: photo.uri }));
      const probeUri = await shrinkProbe(photo.uri);

      setState((prev) => ({ ...prev, phase: 'verifying' }));
      const result = await identifyFace(sessionId, {
        uri: probeUri,
        name: 'probe.jpg',
        type: 'image/jpeg',
      });

      if (!result.match) return reject(result.detail ?? 'No match found.', result);

      setState((prev) => ({ ...prev, phase: 'matched', result, error: null }));
      haptic('success');
      onMatched(result);
      // Hold the verdict long enough to read, then re-arm for the next student. The
      // shutter stays locked through the hold so the animation can't be cut short.
      holdRef.current = setTimeout(() => release(() => IDLE), MATCH_HOLD_MS);
    } catch (err) {
      // A 422 means the capture itself was unusable (no face / too blurry). Its detail
      // is written for the invigilator, so surface it instead of a generic failure.
      const detail = getProblemDetail(err)?.detail;
      logger.warn('face identify failed', { sessionId, detail });
      reject(detail ?? 'Verification failed. Try again.');
    }
  }, [clearHold, onMatched, reject, release, sessionId]);

  return { cameraRef, ...state, busy: isBusy(state.phase), capture };
}
