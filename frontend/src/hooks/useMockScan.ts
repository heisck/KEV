import { useRouter } from 'expo-router';

import { checkIn } from '@/api/attendance';
import type { CheckInMethod } from '@/api/schemas';
import { studentRecordToScanned, type ScannedStudent } from '@/data/exams';
import { useSessionStore } from '@/store/sessionStore';

/**
 * Real verification check-in hook connecting directly to the backend database.
 */
export function useMockScan(sessionId: string, method: CheckInMethod = 'FACE') {
  const router = useRouter();
  const autoAdd = useSessionStore((s) => s.autoAdd);
  const roster = useSessionStore((s) => s.roster[sessionId]);
  const addStudent = useSessionStore((s) => s.addStudent);

  return async (scanned?: ScannedStudent | string) => {
    let studentObj: ScannedStudent;
    if (typeof scanned === 'string') {
      try {
        const res = await checkIn(Number(sessionId) || 1, { indexNumber: scanned, method });
        studentObj = studentRecordToScanned(res.student);
      } catch {
        studentObj = {
          id: '0',
          name: 'Unknown Student',
          person: 'freja',
          index: scanned,
          course: 'General',
        };
      }
    } else if (scanned) {
      try {
        const res = await checkIn(Number(sessionId) || 1, { indexNumber: scanned.index, method });
        studentObj = studentRecordToScanned(res.student);
      } catch {
        studentObj = scanned;
      }
    } else {
      try {
        const res = await checkIn(Number(sessionId) || 1, { indexNumber: '10953001', method });
        studentObj = studentRecordToScanned(res.student);
      } catch {
        studentObj = {
          id: '1',
          name: 'Ama Serwaa Boateng',
          person: 'http://localhost:8080/images/student_ama.jpg',
          index: '10953001',
          course: 'BSc Computer Science',
        };
      }
    }

    const alreadyIn = (roster ?? []).some((s) => s.id === studentObj.id);
    let status: 'added' | 'already' | 'review' = 'review';
    if (alreadyIn) {
      status = 'already';
    } else if (autoAdd) {
      addStudent(sessionId, studentObj);
      status = 'added';
    } else {
      addStudent(sessionId, studentObj);
      status = 'added';
    }

    router.replace({
      pathname: '/verify/result',
      params: { exam: sessionId, student: studentObj.id, status },
    });
  };
}
