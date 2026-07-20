import { filterSessionStudents, resolveStudentPhotoUrl, type ScannedStudent } from '@/data/exams';

const students: ScannedStudent[] = [
  { id: '2', name: 'Zara Cole', index: '2002', course: 'CS', person: 'zara', method: 'FACE' },
  { id: '1', name: 'Ama Boateng', index: '1001', course: 'CS', person: 'ama', method: 'NFC' },
  { id: '3', name: 'Kojo Mensah', index: '3003', course: 'CS', person: 'kojo', method: 'MANUAL' },
];

it('searches students by name or index number', () => {
  expect(filterSessionStudents(students, 'boat', null, false).map((student) => student.id)).toEqual(
    ['1'],
  );
  expect(filterSessionStudents(students, '3003', null, false).map((student) => student.id)).toEqual(
    ['3'],
  );
});

it('filters by scan method and sorts names in ascending order', () => {
  expect(filterSessionStudents(students, '', 'FACE', false).map((student) => student.id)).toEqual([
    '2',
  ]);
  expect(filterSessionStudents(students, '', null, true).map((student) => student.name)).toEqual([
    'Ama Boateng',
    'Kojo Mensah',
    'Zara Cole',
  ]);
});

it('uses the configured API host for backend student images', () => {
  expect(
    resolveStudentPhotoUrl(
      'http://localhost:8080/images/student_ama.jpg',
      'http://10.36.12.97:8080',
    ),
  ).toBe('http://10.36.12.97:8080/images/student_ama.jpg');
  expect(
    resolveStudentPhotoUrl('https://images.example.com/student.jpg', 'http://10.36.12.97:8080'),
  ).toBe('https://images.example.com/student.jpg');
});
