import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { FormattedReportText } from '@/components/reports/FormattedReportText';

it('renders strike-through and aligned report markup', () => {
  const screen = render(<FormattedReportText value={'~~removed~~\n<right>aligned</right>'} />);

  expect(StyleSheet.flatten(screen.getByText('removed').props.style)).toEqual(
    expect.objectContaining({ textDecorationLine: 'line-through' }),
  );
  expect(StyleSheet.flatten(screen.getByText('aligned').props.style)).toEqual(
    expect.objectContaining({ textAlign: 'right' }),
  );
});
