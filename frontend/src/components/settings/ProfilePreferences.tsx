import type { CheckInMethod } from '@/api/schemas';
import {
  AppearanceContrastIcon,
  BellIcon,
  DocIcon,
  KeypadIcon,
  MailIcon,
  PhoneIcon,
  ScanFrameIcon,
} from '@/components/kev/icons';
import { ProfileRow, SectionLabel } from '@/components/settings/ProfileSettingsRows';
import { SegmentedControl, SettingToggle } from '@/components/settings/SettingsControls';
import { useSettingsStore } from '@/store/settingsStore';
import type { Palette } from '@/theme';

const SCAN_OPTIONS: { value: CheckInMethod; label: string }[] = [
  { value: 'FACE', label: 'Face' },
  { value: 'NFC', label: 'NFC' },
  { value: 'MANUAL', label: 'Manual' },
];

export function ProfilePreferences({ palette }: { palette: Palette }) {
  const settings = useSettingsStore();
  return (
    <>
      <SectionLabel text="Preferences" palette={palette} />
      <ProfileRow
        icon={<PhoneIcon color={palette.primary} size={18} />}
        label="Use system appearance"
        palette={palette}
        trailing={
          <SettingToggle
            value={settings.theme === 'system'}
            onToggle={() => settings.setTheme(settings.theme === 'system' ? 'light' : 'system')}
            testID="setting-system-theme"
          />
        }
      />
      {settings.theme !== 'system' ? (
        <ProfileRow
          icon={<AppearanceContrastIcon color={palette.primary} size={18} />}
          label="Dark mode"
          palette={palette}
          trailing={
            <SettingToggle
              value={settings.theme === 'dark'}
              onToggle={() => settings.setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
              testID="setting-dark-theme"
            />
          }
        />
      ) : null}
      <ProfileRow
        icon={<ScanFrameIcon color={palette.primary} size={18} />}
        label="Use all scan methods"
        palette={palette}
        trailing={
          <SettingToggle
            value={settings.useAllScanMethods}
            onToggle={() => settings.setUseAllScanMethods(!settings.useAllScanMethods)}
            testID="setting-all-scan-methods"
          />
        }
      />
      {!settings.useAllScanMethods ? (
        <ProfileRow
          icon={<KeypadIcon color={palette.primary} size={18} />}
          label="Preferred scan method"
          palette={palette}
          trailing={
            <SegmentedControl
              options={SCAN_OPTIONS}
              value={settings.defaultScanMethod}
              onChange={settings.setDefaultScanMethod}
              palette={palette}
            />
          }
        />
      ) : null}
      <ProfileRow
        icon={<BellIcon color={palette.primary} size={18} />}
        label="Haptics"
        palette={palette}
        trailing={
          <SettingToggle
            value={settings.hapticsEnabled}
            onToggle={() => settings.setHapticsEnabled(!settings.hapticsEnabled)}
            testID="setting-haptics"
          />
        }
      />
      <ProfileRow
        icon={<DocIcon color={palette.primary} size={18} />}
        label="Show result page"
        palette={palette}
        trailing={
          <SettingToggle
            value={settings.showSuccessPage}
            onToggle={() => settings.setShowSuccessPage(!settings.showSuccessPage)}
            testID="setting-success-page"
          />
        }
      />
      <ProfileRow
        icon={<MailIcon color={palette.primary} size={18} />}
        label="Notifications"
        palette={palette}
        trailing={
          <SettingToggle
            value={settings.notificationsEnabled}
            onToggle={() => settings.setNotificationsEnabled(!settings.notificationsEnabled)}
            testID="setting-notifications"
          />
        }
      />
    </>
  );
}
