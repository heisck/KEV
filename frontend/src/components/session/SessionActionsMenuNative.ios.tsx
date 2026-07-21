import { Button, Host, Menu } from '@expo/ui/swift-ui';

import type { SessionActionsMenuProps } from '@/components/session/SessionActionsMenuBase';

/** Native SwiftUI menu, available after the iOS dev client links ExpoUI. */
export function SessionActionsMenuNative({
  code,
  password,
  lecturers,
  joined,
  onJoin,
}: SessionActionsMenuProps) {
  return (
    <Host matchContents style={{ height: 44, width: 44 }}>
      <Menu label="" systemImage="ellipsis.circle">
        {joined ? (
          <>
            <Button label={`Session code: ${code ?? 'Loading'}`} />
            <Button label={`Password: ${password ?? 'Loading'}`} />
            {lecturers.map((lecturer) => (
              <Button
                key={lecturer.userId}
                label={lecturer.displayName ?? lecturer.email ?? 'Lecturer'}
              />
            ))}
          </>
        ) : (
          <Button label="Join session" onPress={onJoin} />
        )}
      </Menu>
    </Host>
  );
}
