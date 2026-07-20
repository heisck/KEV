import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';

import { checkIn } from '@/api/attendance';
import { getProblemDetail, type CheckInMethod } from '@/api/schemas';
import { studentRecordToScanned, type ScannedStudent } from '@/data/exams';
import { haptic } from '@/lib/haptics';
import { toast } from '@/lib/toast';
import { useSessionStore } from '@/store/sessionStore';
import { useSettingsStore } from '@/store/settingsStore';

type Outcome = 'added' | 'already' | 'error';

export function shouldShowScanResult(showSuccessPage: boolean, outcome: Outcome): boolean {
  return showSuccessPage && outcome !== 'error';
}

/** Resolve the index number to check in from the scan hook's flexible input. */
function indexOf(scanned?: ScannedStudent | string): string {
  if (typeof scanned === 'string') return scanned.trim();
  if (scanned) return scanned.index;
  return '10953001'; // demo fallback until live NFC/face capture provides the id
}

/**
 * Verification check-in against the backend. Honors the user's "show result
 * page" preference: when on, routes to the result screen; when off, gives an
 * instant toast + haptic and stays on the scanner for the next student.
 */
export function useMockScan(sessionId: string, method: CheckInMethod = 'FACE') {
  const router = useRouter();
  const addStudent = useSessionStore((s) => s.addStudent);

  return async (scanned?: ScannedStudent | string) => {
    const sid = Number(sessionId) || 1;
    let student: ScannedStudent | null = typeof scanned === 'object' ? scanned : null;
    let outcome: Outcome = 'added';

    try {
      const record = await checkIn(sid, { indexNumber: indexOf(scanned), method });
      student = studentRecordToScanned(record.student, record.method, record.id);
      addStudent(sessionId, student);
    } catch (err) {
      if (
        isAxiosError(err) &&
        err.response?.status === 409 &&
        getProblemDetail(err)?.detail === 'Student already checked in'
      ) {
        outcome = 'already';
      } else {
        outcome = 'error';
      }
    }

    const showSuccessPage = useSettingsStore.getState().showSuccessPage;
    if (shouldShowScanResult(showSuccessPage, outcome)) {
      router.replace({
        pathname: '/verify/result',
        params: { exam: sessionId, student: student?.id ?? '0', status: outcome, method },
      });
      return;
    }

    // Quick-feedback mode: toast + vibration, no navigation.
    if (outcome === 'added') {
      haptic('success');
      toast.success(`${student?.name ?? 'Student'} added`);
    } else if (outcome === 'already') {
      haptic('warning');
      toast.info(`${student?.name ?? 'Student'} is already in this class`);
    } else {
      haptic('error');
      toast.error('Could not verify. Try again');
    }
  };
}
