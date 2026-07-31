import { fireEvent, render } from '@testing-library/react-native';

import { CreateLecturerSheet } from '@/screens/CreateLecturerSheet';

const mockMutate = jest.fn();

jest.mock('@/api/hooks', () => ({
  useCreateLecturer: () => ({ isPending: false, mutate: mockMutate }),
}));

beforeEach(() => mockMutate.mockReset());

it('submits a trimmed lecturer account', () => {
  const screen = render(<CreateLecturerSheet onClose={jest.fn()} />);

  fireEvent.changeText(screen.getByPlaceholderText('e.g. Dr. Kwame Mensah'), ' Dr. Ada Mensah ');
  fireEvent.changeText(screen.getByPlaceholderText('e.g. LEC-001'), ' LEC-042 ');
  fireEvent.changeText(
    screen.getByPlaceholderText('e.g. kwame.mensah@university.edu'),
    ' ada@university.edu ',
  );
  fireEvent.changeText(
    screen.getByPlaceholderText('e.g. kwame.personal@gmail.com'),
    ' ada@gmail.com ',
  );
  fireEvent.changeText(screen.getByPlaceholderText('e.g. +233 24 000 0000'), ' +233240000000 ');
  fireEvent.press(screen.getByText('Create Lecturer'));

  expect(mockMutate).toHaveBeenCalledWith(
    {
      fullName: 'Dr. Ada Mensah',
      lecturerId: 'LEC-042',
      personalEmail: 'ada@gmail.com',
      phone: '+233240000000',
      universityEmail: 'ada@university.edu',
    },
    expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
  );
});

it('rejects invalid lecturer details before the API call', () => {
  const screen = render(<CreateLecturerSheet onClose={jest.fn()} />);

  fireEvent.press(screen.getByText('Create Lecturer'));

  expect(screen.getByText('All lecturer details are required.')).toBeTruthy();
  expect(mockMutate).not.toHaveBeenCalled();
});

it('shows field errors for malformed lecturer email addresses', () => {
  const screen = render(<CreateLecturerSheet onClose={jest.fn()} />);

  fireEvent.changeText(screen.getByPlaceholderText('e.g. Dr. Kwame Mensah'), 'Dr. Ada Mensah');
  fireEvent.changeText(screen.getByPlaceholderText('e.g. LEC-001'), 'LEC-042');
  fireEvent.changeText(
    screen.getByPlaceholderText('e.g. kwame.mensah@university.edu'),
    'not-an-email',
  );
  fireEvent.changeText(
    screen.getByPlaceholderText('e.g. kwame.personal@gmail.com'),
    'also-invalid',
  );
  fireEvent.changeText(screen.getByPlaceholderText('e.g. +233 24 000 0000'), '+233240000000');
  fireEvent.press(screen.getByText('Create Lecturer'));

  expect(screen.getByText('Enter a valid university email')).toBeTruthy();
  expect(screen.getByText('Enter a valid personal email')).toBeTruthy();
  expect(mockMutate).not.toHaveBeenCalled();
});
