import { useSessionStore } from '@/store/sessionStore';

describe('sessionStore scan lock', () => {
  beforeEach(() => {
    useSessionStore.setState({ joined: {}, lockedSessionId: null, roster: {} });
  });

  it('locks and unlocks one scan session', () => {
    useSessionStore.getState().toggleSessionLock('42');
    expect(useSessionStore.getState().lockedSessionId).toBe('42');

    useSessionStore.getState().toggleSessionLock('42');
    expect(useSessionStore.getState().lockedSessionId).toBeNull();
  });

  it('moves the lock when another session is selected', () => {
    useSessionStore.getState().toggleSessionLock('42');
    useSessionStore.getState().toggleSessionLock('77');

    expect(useSessionStore.getState().lockedSessionId).toBe('77');
  });

  it('updates an existing roster student with the recorded scan method', () => {
    const student = {
      id: '7',
      name: 'Ama Boateng',
      person: 'https://example.com/ama.jpg',
      index: '10953001',
      course: 'BSc CS',
    };

    useSessionStore.getState().addStudent('42', student);
    useSessionStore.getState().addStudent('42', { ...student, method: 'NFC' });

    expect(useSessionStore.getState().roster['42']).toEqual([{ ...student, method: 'NFC' }]);
  });

  it('removes a student from the local session roster', () => {
    useSessionStore.getState().addStudent('42', {
      id: '7',
      name: 'Ama Boateng',
      person: 'ama',
      index: '10953001',
      course: 'BSc CS',
    });

    useSessionStore.getState().removeStudent('42', '7');

    expect(useSessionStore.getState().roster['42']).toEqual([]);
  });
});
