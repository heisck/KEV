import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useSessionDetail } from '@/api/hooks';
import { type AppScanMethod, allowedScanMethods } from '@/lib/scanMethods';
import { toast } from '@/lib/toast';
import { useSettingsStore } from '@/store/settingsStore';

export function useScanMethodGuard(sessionId: string, active: AppScanMethod) {
  const router = useRouter();
  const { data, isLoading } = useSessionDetail(Number(sessionId) || 1);
  const preferred = useSettingsStore((state) => state.defaultScanMethod);
  const useAll = useSettingsStore((state) => state.useAllScanMethods);
  const methods = data
    ? allowedScanMethods(data.session.verificationMethods, useAll, preferred)
    : [];
  const ready = !isLoading && Boolean(data);
  const canUse = ready && methods.includes(active);

  useEffect(() => {
    if (!ready || canUse) return;
    toast.info('This scan method is not enabled for you in this session');
    router.replace({ pathname: '/verify', params: { exam: sessionId } });
  }, [canUse, ready, router, sessionId]);

  return { allowedMethods: methods, canUse };
}
