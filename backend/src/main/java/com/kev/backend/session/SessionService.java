package com.kev.backend.session;

import com.kev.backend.attendance.AttendanceMapper;
import com.kev.backend.attendance.AttendanceRecordRepository;
import com.kev.backend.attendance.AttendanceStatus;
import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.common.ApiException;
import com.kev.backend.session.dto.CreateSessionRequest;
import com.kev.backend.session.dto.InvigilatorDto;
import com.kev.backend.session.dto.SessionDetailDto;
import com.kev.backend.session.dto.SessionDto;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SessionService {

    private static final String CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ExamSessionRepository sessions;
    private final SessionInvigilatorRepository invigilators;
    private final AttendanceRecordRepository attendance;
    private final UserRepository users;
    private final AttendanceMapper attendanceMapper;

    public SessionService(
            ExamSessionRepository sessions,
            SessionInvigilatorRepository invigilators,
            AttendanceRecordRepository attendance,
            UserRepository users,
            AttendanceMapper attendanceMapper) {
        this.sessions = sessions;
        this.invigilators = invigilators;
        this.attendance = attendance;
        this.users = users;
        this.attendanceMapper = attendanceMapper;
    }

    @Transactional
    public SessionDto create(UUID userId, CreateSessionRequest req) {
        ExamSession session = new ExamSession();
        session.setSessionCode(uniqueCode());
        session.setCourseCodes(String.join(",", req.courseCodes()));
        session.setBuilding(req.building());
        session.setFloor(req.floor());
        session.setRoom(req.room());
        session.setIndexRangeStart(req.indexRangeStart());
        session.setIndexRangeEnd(req.indexRangeEnd());
        session.setCreatedBy(userId);
        ExamSession saved = sessions.save(session);
        addMember(saved.getId(), userId, null);
        return toDto(saved);
    }

    @Transactional
    public SessionDto join(UUID userId, String sessionCode) {
        ExamSession session = sessions.findBySessionCode(sessionCode.trim().toUpperCase())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No session with that code"));
        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new ApiException(HttpStatus.CONFLICT, "Session has ended");
        }
        if (!invigilators.existsBySessionIdAndUserId(session.getId(), userId)) {
            addMember(session.getId(), userId, null);
        }
        return toDto(session);
    }

    @Transactional
    public SessionDto end(UUID userId, Long sessionId) {
        ExamSession session = require(sessionId);
        if (!session.getCreatedBy().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the session creator can end it");
        }
        if (session.getStatus() == SessionStatus.ACTIVE) {
            session.setStatus(SessionStatus.ENDED);
            session.setEndedAt(java.time.Instant.now());
        }
        return toDto(session);
    }

    @Transactional(readOnly = true)
    public List<SessionDto> listForUser(UUID userId) {
        return sessions.findAllForUser(userId).stream().map(this::toDto).toList();
    }

    /** All sessions, newest first — admin overview. */
    @Transactional(readOnly = true)
    public List<SessionDto> listAll() {
        return sessions
                .findAll(org.springframework.data.domain.Sort.by("startedAt").descending())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public SessionDetailDto detail(UUID userId, Long sessionId) {
        ExamSession session = requireMember(userId, sessionId);
        List<InvigilatorDto> members = invigilators.findBySessionId(sessionId).stream()
                .map(this::toInvigilatorDto)
                .toList();
        var records = attendance.findBySessionIdOrderByCheckedInAtDesc(sessionId);
        return new SessionDetailDto(toDto(session), members, attendanceMapper.toDtos(records));
    }

    /** Loads the session and rejects callers who are neither creator nor invigilator. */
    @Transactional(readOnly = true)
    public ExamSession requireMember(UUID userId, Long sessionId) {
        ExamSession session = require(sessionId);
        boolean member =
                session.getCreatedBy().equals(userId) || invigilators.existsBySessionIdAndUserId(sessionId, userId);
        if (!member) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not an invigilator of this session");
        }
        return session;
    }

    public ExamSession require(Long sessionId) {
        return sessions.findById(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));
    }

    void addMember(Long sessionId, UUID userId, UUID assignedBy) {
        SessionInvigilator membership = new SessionInvigilator();
        membership.setSessionId(sessionId);
        membership.setUserId(userId);
        membership.setAssignedBy(assignedBy);
        invigilators.save(membership);
    }

    public SessionDto toDto(ExamSession session) {
        long checkedIn = attendance.countBySessionIdAndStatus(session.getId(), AttendanceStatus.CHECKED_IN);
        long members = invigilators.countBySessionId(session.getId());
        return SessionDto.from(session, checkedIn, members);
    }

    private InvigilatorDto toInvigilatorDto(SessionInvigilator membership) {
        User user = users.findById(membership.getUserId()).orElse(null);
        return new InvigilatorDto(
                membership.getUserId(),
                user != null ? user.getDisplayName() : null,
                user != null ? user.getEmail() : null,
                user != null ? user.getPictureUrl() : null,
                membership.getJoinedAt(),
                membership.getAssignedBy() != null);
    }

    private String uniqueCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder("KEV-");
            for (int i = 0; i < 4; i++) {
                sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
            }
            String code = sb.toString();
            if (!sessions.existsBySessionCode(code)) {
                return code;
            }
        }
        throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not allocate session code");
    }
}
