package com.kev.backend.session;

import com.kev.backend.directory.DirectoryStudentRepository;
import com.kev.backend.session.dto.RosterStudentDto;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lists the students a session expects, as opposed to the ones it has checked in.
 *
 * <p>Reads straight from the directory rather than from ingest state, so the roster is
 * whatever has been committed so far: rows appear here while the background sync is still
 * running, and survive a sync that never finishes.
 */
@Service
public class SessionRosterService {

    private final SessionService sessions;
    private final DirectoryStudentRepository students;

    public SessionRosterService(SessionService sessions, DirectoryStudentRepository students) {
        this.sessions = sessions;
        this.students = students;
    }

    @Transactional(readOnly = true)
    public List<RosterStudentDto> roster(UUID userId, Long sessionId) {
        ExamSession session = sessions.requireMember(userId, sessionId);
        if (session.getIndexRangeStart() == null || session.getIndexRangeEnd() == null) {
            return List.of();
        }
        return students.findInIndexRange(session.getIndexRangeStart(), session.getIndexRangeEnd()).stream()
                .map(RosterStudentDto::from)
                .toList();
    }
}
