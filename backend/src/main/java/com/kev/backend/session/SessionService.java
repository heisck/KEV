package com.kev.backend.session;

import com.kev.backend.attendance.AttendanceMapper;
import com.kev.backend.attendance.AttendanceRecordRepository;
import com.kev.backend.attendance.AttendanceStatus;
import com.kev.backend.auth.Role;
import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.common.ApiException;
import com.kev.backend.notification.SessionNotificationService;
import com.kev.backend.session.dto.CreateSessionRequest;
import com.kev.backend.session.dto.InvigilatorDto;
import com.kev.backend.session.dto.SessionDetailDto;
import com.kev.backend.session.dto.SessionDto;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    private final SessionNotificationService sessionNotifications;

    public SessionService(
            ExamSessionRepository sessions,
            SessionInvigilatorRepository invigilators,
            AttendanceRecordRepository attendance,
            UserRepository users,
            AttendanceMapper attendanceMapper,
            SessionNotificationService sessionNotifications) {
        this.sessions = sessions;
        this.invigilators = invigilators;
        this.attendance = attendance;
        this.users = users;
        this.attendanceMapper = attendanceMapper;
        this.sessionNotifications = sessionNotifications;
    }

    @Transactional
    public SessionDto create(UUID userId, CreateSessionRequest req) {
        ExamSession session = new ExamSession();
        session.setSessionCode(uniqueCode());
        session.setSessionPassword(uniquePassword());
        applyEditableFields(session, req);
        if (session.getExamDate() != null) {
            java.time.LocalDate today = java.time.LocalDate.now();
            if (session.getExamDate().isBefore(today)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot create a session in the past");
            }
            if (session.getExamDate().isEqual(today)) {
                java.time.LocalTime cutoff = java.time.LocalTime.now().minusMinutes(5);
                if (session.getStartTime() != null && !session.getStartTime().isBlank()) {
                    try {
                        java.time.LocalTime start =
                                java.time.LocalTime.parse(session.getStartTime().trim());
                        if (start.isBefore(cutoff)) {
                            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot create a session in the past");
                        }
                    } catch (Exception ignored) {
                    }
                }
                if (session.getEndTime() != null && !session.getEndTime().isBlank()) {
                    try {
                        java.time.LocalTime end =
                                java.time.LocalTime.parse(session.getEndTime().trim());
                        if (end.isBefore(cutoff)) {
                            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot create a session in the past");
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
        }
        session.setCreatedBy(userId);
        ExamSession saved = sessions.save(session);
        addMember(saved.getId(), userId, null, "CREATOR");
        SessionStatus status = resolvedStatus(saved);
        String msg = status == SessionStatus.ACTIVE
                ? sessionTitle(saved) + " is now active and ready for check-in"
                : sessionTitle(saved) + " is scheduled for "
                        + (saved.getExamDate() != null ? saved.getExamDate() : "upcoming date");
        sessionNotifications.notifyLecturers(saved.getId(), "Session created", msg);
        return toDto(saved);
    }

    @Transactional
    public SessionDto update(UUID userId, Long sessionId, CreateSessionRequest req) {
        ExamSession session = requireMember(userId, sessionId);
        SessionStatus status = resolvedStatus(session);
        if (status == SessionStatus.COMPLETED || status == SessionStatus.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT, "Closed sessions cannot be edited");
        }
        applyEditableFields(session, req);
        return toDto(sessions.save(session));
    }

    @Transactional
    public SessionDto join(UUID userId, String sessionCodeOrPassword) {
        String query =
                sessionCodeOrPassword != null ? sessionCodeOrPassword.trim().toUpperCase() : "";
        ExamSession session = sessions.findBySessionCodeOrSessionPassword(query, query)
                .or(() -> sessions.findBySessionCode(query))
                .or(() -> sessions.findBySessionPassword(query))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No session matches that code or password"));
        if (isPast(session)) {
            throw new ApiException(HttpStatus.CONFLICT, "Session is closed");
        }
        if (!invigilators.existsBySessionIdAndUserId(session.getId(), userId)) {
            addMember(session.getId(), userId, null, "INVIGILATOR");
        }
        return toDto(session);
    }

    @Transactional
    public SessionDto joinByPassword(UUID userId, Long sessionId, String password) {
        ExamSession session = require(sessionId);
        if (isPast(session)) {
            throw new ApiException(HttpStatus.CONFLICT, "Session is closed");
        }
        String supplied = password != null ? password.trim().toUpperCase() : "";
        byte[] a = supplied.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        byte[] b = (session.getSessionPassword() != null ? session.getSessionPassword() : "")
                .getBytes(java.nio.charset.StandardCharsets.UTF_8);
        if (!java.security.MessageDigest.isEqual(a, b)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Incorrect session password");
        }
        if (!invigilators.existsBySessionIdAndUserId(sessionId, userId)) {
            addMember(sessionId, userId, null, "INVIGILATOR");
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
            sessionNotifications.notifyLecturers(
                    session.getId(), "Session ended", sessionTitle(session) + " has closed");
        }
        return toDto(session);
    }

    @Transactional(readOnly = true)
    public List<SessionDto> listForUser(UUID userId) {
        List<ExamSession> all = sessions.findAllByOrderByStartedAtDesc();
        if (all.isEmpty()) return List.of();
        Set<Long> joinedIds = new HashSet<>(invigilators.findSessionIdsByUserId(userId));
        List<Long> ids = all.stream().map(s -> s.getId()).toList();
        Map<Long, Long> checkedIn = countMap(attendance.countCheckedInBySessionIds(ids));
        Map<Long, Long> members = countMap(invigilators.countBySessionIds(ids));
        return all.stream()
                .map(session -> toDto(
                        session,
                        isJoined(session, userId, joinedIds),
                        checkedIn.getOrDefault(session.getId(), 0L),
                        members.getOrDefault(session.getId(), 0L)))
                .toList();
    }

    /** All sessions, newest first — admin overview. */
    @Transactional(readOnly = true)
    public List<SessionDto> listAll() {
        return sessions.findAllByOrderByStartedAtDesc().stream()
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

    /** Loads the session and rejects callers who are neither creator, invigilator, nor admin. */
    @Transactional(readOnly = true)
    public ExamSession requireMember(UUID userId, Long sessionId) {
        ExamSession session = require(sessionId);
        User user = users.findById(userId).orElse(null);
        boolean isAdmin = user != null && user.getRole() == Role.ADMIN;
        boolean member = isAdmin
                || session.getCreatedBy().equals(userId)
                || invigilators.existsBySessionIdAndUserId(sessionId, userId);
        if (!member) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not an invigilator of this session");
        }
        return session;
    }

    /** Loads a session exposed by the lecturer session list, without requiring membership. */
    @Transactional(readOnly = true)
    public ExamSession requireVisible(Long sessionId) {
        return require(sessionId);
    }

    @Transactional(readOnly = true)
    public ExamSession requireOngoingMember(UUID userId, Long sessionId) {
        ExamSession session = requireMember(userId, sessionId);
        SessionStatus status = resolvedStatus(session);
        if (status == SessionStatus.UPCOMING) {
            throw new ApiException(HttpStatus.CONFLICT, "Session has not started");
        }
        if (status != SessionStatus.ONGOING) {
            throw new ApiException(HttpStatus.CONFLICT, "Session is closed");
        }
        return session;
    }

    public java.util.Optional<ExamSession> find(Long sessionId) {
        return sessionId != null ? sessions.findById(sessionId) : java.util.Optional.empty();
    }

    public ExamSession require(Long sessionId) {
        return sessions.findById(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));
    }

    void addMember(Long sessionId, UUID userId, UUID assignedBy, String role) {
        SessionInvigilator membership = new SessionInvigilator();
        membership.setSessionId(sessionId);
        membership.setUserId(userId);
        membership.setAssignedBy(assignedBy);
        membership.setRole(role != null ? role : "INVIGILATOR");
        invigilators.save(membership);
    }

    public SessionDto toDto(ExamSession session) {
        long checkedIn = attendance.countBySessionIdAndStatus(session.getId(), AttendanceStatus.CHECKED_IN);
        long members = invigilators.countBySessionId(session.getId());
        String status = resolvedStatus(session).name();
        return SessionDto.from(session, status, checkedIn, members, true);
    }

    private SessionDto toDto(ExamSession session, boolean joined, long checkedIn, long members) {
        return SessionDto.from(session, resolvedStatus(session).name(), checkedIn, members, joined);
    }

    private Map<Long, Long> countMap(List<SessionCount> counts) {
        Map<Long, Long> result = new HashMap<>();
        counts.forEach(count -> result.put(count.sessionId(), count.count()));
        return result;
    }

    private boolean isPast(ExamSession session) {
        SessionStatus status = resolvedStatus(session);
        return status == SessionStatus.COMPLETED || status == SessionStatus.CANCELLED;
    }

    private boolean isJoined(ExamSession session, UUID userId, Set<Long> joinedIds) {
        return userId.equals(session.getCreatedBy()) || joinedIds.contains(session.getId());
    }

    private SessionStatus resolvedStatus(ExamSession session) {
        return SessionStatusCalculator.resolve(session, java.time.LocalDateTime.now());
    }

    private InvigilatorDto toInvigilatorDto(SessionInvigilator membership) {
        User user = users.findById(membership.getUserId()).orElse(null);
        return new InvigilatorDto(
                membership.getUserId(),
                user != null ? user.getDisplayName() : null,
                user != null ? user.getEmail() : null,
                user != null ? user.getPictureUrl() : null,
                membership.getJoinedAt(),
                membership.getAssignedBy() != null,
                membership.getRole());
    }

    private void applyEditableFields(ExamSession session, CreateSessionRequest req) {
        session.setTitle(
                req.title() != null && !req.title().isBlank()
                        ? req.title().trim()
                        : (req.building() + " " + (req.room() != null ? req.room() : "")).trim());
        session.setCourseCodes(req.courseCodes() != null ? String.join(",", req.courseCodes()) : "");
        session.setBuilding(req.building().trim());
        session.setFloor(req.floor());
        session.setRoom(req.room());
        session.setIndexRangeStart(req.indexRangeStart());
        session.setIndexRangeEnd(req.indexRangeEnd());
        session.setExamDate(req.examDate());
        session.setStartTime(req.startTime());
        session.setEndTime(req.endTime());
        String methods =
                req.verificationMethods() != null && !req.verificationMethods().isEmpty()
                        ? String.join(",", req.verificationMethods())
                        : "FACE,NFC,MANUAL";
        session.setVerificationMethods(methods);
    }

    private String uniquePassword() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
        }
        return sb.toString();
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

    private String sessionTitle(ExamSession session) {
        return session.getTitle() != null && !session.getTitle().isBlank()
                ? session.getTitle()
                : session.getSessionCode();
    }
}
