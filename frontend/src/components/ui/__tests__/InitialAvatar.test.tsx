import { render } from '@testing-library/react-native';

import { InitialAvatar } from '@/components/ui/InitialAvatar';

describe('InitialAvatar', () => {
  it('shows the uppercased first initial when no photo is provided', () => {
    const { getByText } = render(
      <InitialAvatar seed="ama boateng" imageStyle={{}} fallbackStyle={{}} initialStyle={{}} />,
    );
    expect(getByText('A')).toBeTruthy();
  });

  it('renders the photo instead of an initial when a uri is provided', () => {
    const { queryByText } = render(
      <InitialAvatar
        uri="https://example.com/a.png"
        seed="Ama"
        imageStyle={{}}
        fallbackStyle={{}}
        initialStyle={{}}
      />,
    );
    expect(queryByText('A')).toBeNull();
  });
});
