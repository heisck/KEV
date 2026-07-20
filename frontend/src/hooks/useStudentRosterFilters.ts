import { useMemo, useState } from 'react';

import { filterSessionStudents, type ScannedStudent, type StudentMethodFilter } from '@/data/exams';

export function useStudentRosterFilters(students: ScannedStudent[]) {
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState<StudentMethodFilter>(null);
  const [alphabetical, setAlphabetical] = useState(false);
  const filteredStudents = useMemo(
    () => filterSessionStudents(students, query, method, alphabetical),
    [alphabetical, method, query, students],
  );

  return {
    students: filteredStudents,
    controls: {
      alphabetical,
      method,
      onAlphabeticalChange: setAlphabetical,
      onMethodChange: setMethod,
      onQueryChange: setQuery,
      query,
    },
  };
}
