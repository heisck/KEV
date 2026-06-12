import { useState } from 'react';
import { useWindowDimensions } from 'react-native';

/**
 * Window size that ignores the height shrink caused by the on-screen keyboard
 * (mobile web reports a smaller `innerHeight` while it is open). Layout math
 * derived from this stays put when an input is focused. Recaptures on
 * orientation/width change and keeps the tallest height seen for that width.
 */
export function useStableScreenSize() {
  const { height, width } = useWindowDimensions();
  const [stable, setStable] = useState({ height, width });

  // Adjust-state-during-render: React re-renders with the new value immediately,
  // so a keyboard-driven shrink never reaches layout but rotation/growth does.
  if (width !== stable.width || height > stable.height) {
    setStable({ height, width });
  }

  return stable;
}
