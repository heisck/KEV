import { allowedScanMethods } from '@/lib/scanMethods';

it('uses every method allowed by the session when the lecturer allows all', () => {
  expect(allowedScanMethods(['NFC', 'MANUAL'], true, 'FACE')).toEqual(['NFC', 'MANUAL']);
});

it('uses only the preferred method when both lecturer and session allow it', () => {
  expect(allowedScanMethods(['FACE', 'NFC'], false, 'NFC')).toEqual(['NFC']);
});

it('returns no method when the lecturer preference is excluded by the session', () => {
  expect(allowedScanMethods(['FACE'], false, 'NFC')).toEqual([]);
});
