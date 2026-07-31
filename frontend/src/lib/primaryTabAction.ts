import type { AuthRole } from '@/store/authStore';

type PrimaryTabAction = {
  href: '/admin' | '/room-setup';
  title: 'Add' | 'Create';
};

export function getPrimaryTabAction(role: AuthRole | undefined): PrimaryTabAction {
  return role === 'ADMIN'
    ? { href: '/admin', title: 'Add' }
    : { href: '/room-setup', title: 'Create' };
}
