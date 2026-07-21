import { fireEvent, render } from '@testing-library/react-native';
import { Path } from 'react-native-svg';

import { ExamCard } from '@/components/kev/ExamCard';
import type { Exam } from '@/data/exams';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

beforeEach(() => {
  mockPush.mockClear();
  useAuthStore.setState({
    user: { id: 'lecturer-1', email: 'lecturer@example.com', role: 'LECTURER', plan: 'FREE' },
  });
  useFavoritesStore.setState({ byUser: {} });
});

it('keeps long multi-course content inside the session card', () => {
  const course = 'DCIT 301, DCIT 305, DCIT 307, DCIT 309';
  const exam: Exam = {
    id: '42',
    sessionCode: 'KEV-F7K9',
    course,
    dates: '2026-07-20',
    status: 'Ongoing',
    art: 'campus',
    checklist: [
      { label: 'Room assigned: A very long science and engineering building name', kind: 'done' },
    ],
    action: 123,
  };

  const screen = render(<ExamCard exam={exam} />);

  expect(screen.getByText(course).props.numberOfLines).toBe(2);
  expect(screen.getByText('123 students')).toBeTruthy();
});

it('opens an ongoing session summary before scanning', () => {
  const exam: Exam = {
    id: '42',
    sessionCode: 'KEV-F7K9',
    course: 'DCIT 301',
    dates: '2026-07-20',
    status: 'Ongoing',
    art: 'campus',
    checklist: [],
    action: 12,
  };

  const screen = render(<ExamCard exam={exam} />);
  fireEvent.press(screen.getByText('12 students'));

  expect(mockPush).toHaveBeenCalledWith({ pathname: '/exam/[id]', params: { id: '42' } });
});

it('fills the bookmark after saving a session', () => {
  const exam: Exam = {
    id: '42',
    sessionCode: 'KEV-F7K9',
    course: 'DCIT 301',
    dates: '2026-07-20',
    status: 'Ongoing',
    art: 'campus',
    checklist: [],
    action: 12,
  };
  const screen = render(<ExamCard exam={exam} />);
  const saveButton = screen.getByLabelText('Save DCIT 301');

  expect(saveButton.findAllByType(Path)[0].props.fill).toBe('none');
  fireEvent.press(saveButton);

  const removeButton = screen.getByLabelText('Remove DCIT 301 from favorites');
  expect(removeButton.findAllByType(Path)[0].props.fill).not.toBe('none');
});
