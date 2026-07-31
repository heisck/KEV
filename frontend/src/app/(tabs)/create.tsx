import { Redirect } from 'expo-router';

/**
 * The center tab is a role-aware action, not a screen: the tab bar intercepts
 * its press (see app/(tabs)/_layout.tsx). This stub only renders if reached
 * directly — redirect home rather than show a blank tab.
 */
export default function CreateTab() {
  return <Redirect href="/(tabs)" />;
}
