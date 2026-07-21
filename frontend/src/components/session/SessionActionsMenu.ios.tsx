import { requireOptionalNativeModule } from 'expo-modules-core';
import { lazy, Suspense } from 'react';

import {
  SessionActionsMenu as FallbackMenu,
  type SessionActionsMenuProps,
} from './SessionActionsMenuBase';

const expoUiAvailable = Boolean(requireOptionalNativeModule('ExpoUI'));
const NativeMenu = lazy(() =>
  import('./SessionActionsMenuNative.ios').then(({ SessionActionsMenuNative }) => ({
    default: SessionActionsMenuNative,
  })),
);

/** Native Apple menu when ExpoUI is linked; safe glass fallback for older binaries. */
export function SessionActionsMenu(props: SessionActionsMenuProps) {
  if (!expoUiAvailable) return <FallbackMenu {...props} />;
  return (
    <Suspense fallback={<FallbackMenu {...props} />}>
      <NativeMenu {...props} />
    </Suspense>
  );
}
