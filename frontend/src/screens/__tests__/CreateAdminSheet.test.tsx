import { fireEvent, render } from '@testing-library/react-native';

import { CreateAdminSheet } from '@/screens/CreateAdminSheet';

const mockMutate = jest.fn();

jest.mock('@/api/hooks', () => ({
  useCreateAdmin: () => ({ isPending: false, mutate: mockMutate }),
}));

beforeEach(() => mockMutate.mockReset());

it('submits separate sign-in and personal email addresses', () => {
  const screen = render(<CreateAdminSheet onClose={jest.fn()} />);

  fireEvent.changeText(screen.getByPlaceholderText('First name'), ' Ama ');
  fireEvent.changeText(screen.getByPlaceholderText('Last name'), ' Mensah ');
  fireEvent.changeText(
    screen.getByPlaceholderText('e.g. admin@university.edu'),
    ' ama@university.edu ',
  );
  fireEvent.changeText(
    screen.getByPlaceholderText('e.g. admin.personal@gmail.com'),
    ' ama@gmail.com ',
  );
  fireEvent.changeText(screen.getByPlaceholderText('e.g. +233 24 000 0000'), ' +233240000000 ');
  fireEvent.press(screen.getByText('Create Administrator'));

  expect(mockMutate).toHaveBeenCalledWith(
    {
      email: 'ama@university.edu',
      firstName: 'Ama',
      lastName: 'Mensah',
      personalEmail: 'ama@gmail.com',
      phone: '+233240000000',
    },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
});

it('shows field errors for malformed administrator email addresses', () => {
  const screen = render(<CreateAdminSheet onClose={jest.fn()} />);

  fireEvent.changeText(screen.getByPlaceholderText('First name'), 'Ama');
  fireEvent.changeText(screen.getByPlaceholderText('Last name'), 'Mensah');
  fireEvent.changeText(screen.getByPlaceholderText('e.g. admin@university.edu'), 'invalid');
  fireEvent.changeText(screen.getByPlaceholderText('e.g. admin.personal@gmail.com'), 'wrong');
  fireEvent.press(screen.getByText('Create Administrator'));

  expect(screen.getByText('Enter a valid email')).toBeTruthy();
  expect(screen.getByText('Enter a valid personal email')).toBeTruthy();
  expect(mockMutate).not.toHaveBeenCalled();
});
