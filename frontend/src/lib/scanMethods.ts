import type { CheckInMethod } from '@/api/schemas';

export const APP_SCAN_METHODS = [
  'FACE',
  'NFC',
  'MANUAL',
] as const satisfies readonly CheckInMethod[];
export type AppScanMethod = (typeof APP_SCAN_METHODS)[number];

/** Session policy intersected with the lecturer's personal scan preference. */
export function allowedScanMethods(
  sessionMethods: readonly string[] | null | undefined,
  useAllScanMethods: boolean,
  preferred: CheckInMethod,
): AppScanMethod[] {
  const sessionAllowed = sessionMethods?.length
    ? APP_SCAN_METHODS.filter((method) => sessionMethods.includes(method))
    : [...APP_SCAN_METHODS];
  if (useAllScanMethods) return sessionAllowed;
  return sessionAllowed.includes(preferred as AppScanMethod) ? [preferred as AppScanMethod] : [];
}
