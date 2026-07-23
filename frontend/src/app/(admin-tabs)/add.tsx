import { Redirect, type Href } from 'expo-router';

/**
 * The "Add" tab is an action: the tab bar intercepts its press
 * (see admin-tabs _layout.tsx) and opens the admin management screen.
 * This stub only renders if reached directly — redirect home.
 */
export default function AdminAddTab() {
  return <Redirect href={'/(admin-tabs)' as Href} />;
}
