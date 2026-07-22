import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { handleTabPress } from '@/components/navigation/tabPress';

type TabNavigation = BottomTabBarProps['navigation'];

function makeNavigation(defaultPrevented: boolean) {
  const emit = jest.fn().mockReturnValue({ defaultPrevented });
  const navigate = jest.fn();
  return { navigation: { emit, navigate } as unknown as TabNavigation, emit, navigate };
}

describe('handleTabPress', () => {
  it('emits tabPress and navigates when not focused and not prevented', () => {
    const { navigation, emit, navigate } = makeNavigation(false);
    handleTabPress(navigation, 'key-1', 'chat', false);
    expect(emit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'key-1',
      canPreventDefault: true,
    });
    expect(navigate).toHaveBeenCalledWith('chat');
  });

  it('does not navigate when the route is already focused', () => {
    const { navigation, navigate } = makeNavigation(false);
    handleTabPress(navigation, 'key-1', 'chat', true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not navigate when a listener prevents the default', () => {
    const { navigation, navigate } = makeNavigation(true);
    handleTabPress(navigation, 'key-1', 'chat', false);
    expect(navigate).not.toHaveBeenCalled();
  });
});
