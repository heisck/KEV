import { shouldShowScanResult } from '@/hooks/useMockScan';

describe('scan outcome routing', () => {
  it('keeps duplicate scans on the scanner when result pages are disabled', () => {
    expect(shouldShowScanResult(false, 'already')).toBe(false);
  });

  it('keeps successful scans on the scanner when result pages are disabled', () => {
    expect(shouldShowScanResult(false, 'added')).toBe(false);
  });

  it('shows successful and duplicate results only when enabled', () => {
    expect(shouldShowScanResult(true, 'added')).toBe(true);
    expect(shouldShowScanResult(true, 'already')).toBe(true);
  });

  it('never treats an API error as a student result', () => {
    expect(shouldShowScanResult(true, 'error')).toBe(false);
  });
});
