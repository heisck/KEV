import { render } from '@testing-library/react-native';

import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

it('renders accessible loading placeholders for the requested layout', () => {
  const screen = render(<LoadingSkeleton testID="sessions-loading" variant="cards" />);

  expect(screen.getByTestId('sessions-loading')).toBeTruthy();
  expect(screen.getAllByTestId('skeleton-block')).toHaveLength(3);
});
