import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

type TabNavigation = BottomTabBarProps['navigation'];

/**
 * Emits React Navigation's `tabPress` event and navigates to the route unless it
 * is already focused or a listener prevented the default. Shared by the app's tab bars.
 */
export function handleTabPress(
  navigation: TabNavigation,
  routeKey: string,
  routeName: string,
  isFocused: boolean,
) {
  const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
  if (!isFocused && !event.defaultPrevented) {
    navigation.navigate(routeName);
  }
}
