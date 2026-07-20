import { useEffect, useRef } from 'react';

import { useNotifications } from '@/api/hooks';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/store/authStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useSettingsStore } from '@/store/settingsStore';

/** Polls persisted notifications and previews new unread items while the app is open. */
export function NotificationSync() {
  const userId = useAuthStore((state) => state.user?.id);
  const enabled = useSettingsStore((state) => state.notificationsEnabled);
  const replace = useNotificationsStore((state) => state.replace);
  const seen = useRef(new Set<string>());
  const { data } = useNotifications(Boolean(userId) && enabled);

  useEffect(() => {
    seen.current.clear();
    replace([]);
  }, [replace, userId]);

  useEffect(() => {
    if (!data) return;
    const preview = data.find((item) => !item.read && !seen.current.has(item.id));
    data.forEach((item) => seen.current.add(item.id));
    replace(data);
    if (preview) toast.info(`${preview.title}: ${preview.body}`);
  }, [data, replace]);

  return null;
}
