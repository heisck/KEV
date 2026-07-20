import { fireEvent, render } from '@testing-library/react-native';

import { SessionActionsMenu } from '@/components/session/SessionActionsMenu';

it('shows session credentials and API lecturer names in the anchored menu', () => {
  const screen = render(
    <SessionActionsMenu
      code="KEV-ABCD"
      password="ABC789"
      joined
      onJoin={jest.fn()}
      lecturers={[
        {
          userId: '11111111-1111-1111-1111-111111111111',
          displayName: 'Lecturer One',
          email: 'lecturer@example.com',
          pictureUrl: null,
          joinedAt: '2026-07-20T08:00:00Z',
          assignedByAdmin: false,
          role: 'CREATOR',
        },
      ]}
    />,
  );

  fireEvent.press(screen.getByLabelText('Session actions'));
  expect(screen.getByText('Session code: KEV-ABCD')).toBeTruthy();
  expect(screen.getByText('Password: ABC789')).toBeTruthy();
  expect(screen.getByText('Added to this session')).toBeTruthy();
  expect(screen.getByText('Lecturer One')).toBeTruthy();
});
