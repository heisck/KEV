import { Redirect } from 'expo-router';

/**
 * The "Create" tab is an action, not a screen: the tab bar intercepts its press
 * (see app/(tabs)/_layout.tsx) and opens the create-session wizard. This stub
 * only renders if reached directly — redirect home rather than show a blank tab.
 */
export default function CreateTab() {
  return <Redirect href="/(tabs)" />;
}
