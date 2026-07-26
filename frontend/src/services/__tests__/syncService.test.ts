import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  cacheSessionStudents,
  fetchStudentsFromExternalSync,
  getCachedStudents,
  lookupStudentOffline,
  queueVerificationResult,
  sendVerificationResults,
  type ExternalStudentData,
} from '@/services/syncService';

const mockStudents: ExternalStudentData[] = [
  {
    id: 'stu-101',
    firstName: 'John',
    lastName: 'Doe',
    indexNumber: '101',
    studentId: 'STU-001',
    nfcCode: 'NFC-101',
    imageBase64: 'data:image/jpeg;base64,abc123',
  },
  {
    id: 'stu-102',
    firstName: 'Jane',
    lastName: 'Smith',
    indexNumber: '102',
    studentId: 'STU-002',
    nfcCode: 'NFC-102',
  },
];

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('syncService', () => {
  it('caches and retrieves students offline', async () => {
    await cacheSessionStudents('session-xyz', mockStudents, { indexFrom: 1, indexTo: 334 });
    const cached = await getCachedStudents('session-xyz');
    expect(cached).toHaveLength(2);
    expect(cached[0].indexNumber).toBe('101');
  });

  it('looks up student offline by index number or nfc code', async () => {
    await cacheSessionStudents('session-xyz', mockStudents);
    const foundByIndex = await lookupStudentOffline('101', 'session-xyz');
    expect(foundByIndex?.firstName).toBe('John');

    const foundByNfc = await lookupStudentOffline('NFC-102', 'session-xyz');
    expect(foundByNfc?.firstName).toBe('Jane');
  });

  it('fetches students from external sync and triggers progress callbacks', async () => {
    const mockResponse = {
      success: true,
      sessionId: 'session-xyz',
      count: 2,
      data: mockStudents,
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    const progressSpy = jest.fn();
    const result = await fetchStudentsFromExternalSync(
      { indexFrom: 1, indexTo: 334, requestedBy: 'Test Device' },
      progressSpy,
    );

    expect(result.sessionId).toBe('session-xyz');
    expect(progressSpy).toHaveBeenCalledWith(100, expect.any(String));
  });

  it('sends verification results to external sync server', async () => {
    const mockResponse = {
      success: true,
      processed: 1,
      conflicts: 0,
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    await queueVerificationResult('session-xyz', {
      indexNumber: '101',
      verified: true,
      verifiedAt: new Date().toISOString(),
    });

    const res = await sendVerificationResults({
      sessionId: 'session-xyz',
      results: [
        {
          indexNumber: '101',
          verified: true,
          verifiedAt: new Date().toISOString(),
        },
      ],
    });

    expect(res.success).toBe(true);
    expect(res.processed).toBe(1);
  });
});
