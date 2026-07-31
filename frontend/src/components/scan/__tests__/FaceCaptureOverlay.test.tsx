import { render } from '@testing-library/react-native';

import { FaceCaptureOverlay } from '@/components/scan/FaceCaptureOverlay';

it('stays out of the way while the camera is live', () => {
  const screen = render(<FaceCaptureOverlay phase="idle" photoUri={null} />);

  expect(screen.queryByTestId('face-freeze-frame')).toBeNull();
  expect(screen.queryByTestId('face-scan-sweep')).toBeNull();
});

it('freezes the shot and sweeps it while matching', () => {
  const screen = render(<FaceCaptureOverlay phase="verifying" photoUri="file://shot.jpg" />);

  expect(screen.getByTestId('face-freeze-frame')).toBeTruthy();
  expect(screen.getByTestId('face-scan-sweep')).toBeTruthy();
  expect(screen.queryByTestId('face-verdict')).toBeNull();
});

it('swaps the sweep for a verdict badge once the match lands', () => {
  const screen = render(<FaceCaptureOverlay phase="matched" photoUri="file://shot.jpg" />);

  expect(screen.getByTestId('face-verdict')).toBeTruthy();
  expect(screen.queryByTestId('face-scan-sweep')).toBeNull();
});

it('shows the verdict badge over the failed shot too', () => {
  const screen = render(<FaceCaptureOverlay phase="rejected" photoUri="file://shot.jpg" />);

  expect(screen.getByTestId('face-freeze-frame')).toBeTruthy();
  expect(screen.getByTestId('face-verdict')).toBeTruthy();
});
