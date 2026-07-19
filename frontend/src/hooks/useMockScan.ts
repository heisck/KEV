import { useRouter } from 'expo-router';

import { SCAN_POOL, type ScannedStudent } from '@/data/exams';
import { useSessionStore } from '@/store/sessionStore';

/**
 * Simulates a scan hit until the verification API lands: picks (or accepts) a
 * student, applies the auto-add toggle, and routes to the result screen.
 */
export function useMockScan(sessionId: string) {
  const router = useRouter();
  const autoAdd = useSessionStore((s) => s.autoAdd);
  const roster = useSessionStore((s) => s.roster[sessionId]);
  const addStudent = useSessionStore((s) => s.addStudent);

  return (scanned?: ScannedStudent) => {
    const student = scanned ?? SCAN_POOL[Math.floor(Math.random() * SCAN_POOL.length)];
    const alreadyIn = (roster ?? []).some((s) => s.id === student.id);

    let status: 'added' | 'already' | 'review' = 'review';
    if (alreadyIn) {
      status = 'already';
    } else if (autoAdd) {
      addStudent(sessionId, student);
      status = 'added';
    }

    router.replace({
      pathname: '/verify/result',
      params: { exam: sessionId, student: student.id, status },
    });
  };
}
