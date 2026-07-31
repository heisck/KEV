import { getPrimaryTabAction } from '@/lib/primaryTabAction';

it('uses Add Lecturer as the admin primary action', () => {
  expect(getPrimaryTabAction('ADMIN')).toEqual({
    href: '/admin',
    title: 'Add',
  });
});

it('keeps session creation as the lecturer primary action', () => {
  expect(getPrimaryTabAction('LECTURER')).toEqual({
    href: '/room-setup',
    title: 'Create',
  });
});
