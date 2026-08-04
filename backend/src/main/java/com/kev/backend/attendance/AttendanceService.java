package com.kev.backend.attendance;

import com.kev.backend.attendance.dto.AttendanceDto;
import com.kev.backend.common.ApiException;
import com.kev.backend.directory.NfcCodeNormalizer;
import com.kev.backend.directory.UniversityDirectory;
import com.kev.backend.directory.dto.StudentRecord;
import com.kev.backend.session.ExamSession;
import com.kev.backend.session.SessionService;
import com.kev.backend.session.dto.SessionSummaryDto;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttendanceService {

    private final AttendanceRecordRepository records;
    private final UniversityDirectory directory;
    private final SessionService sessions;
    private final AttendanceMapper mapper;

    public AttendanceService(
            AttendanceRecordRepository records,
            UniversityDirectory directory,
            SessionService sessions,
            AttendanceMapper mapper) {
        this.records = records;
        this.directory = directory;
        this.sessions = sessions;
        this.mapper = mapper;
    }

    @Transactional
    public AttendanceDto checkIn(UUID userId, Long sessionId, String indexNumber, CheckInMethod method) {
        return checkIn(userId, sessionId, indexNumber, null, method);
    }

    @Transactional
    public AttendanceDto checkIn(UUID userId, Long sessionId, String indexNumber, String nfcUid, CheckInMethod method) {
        ExamSession session = requireActiveMembership(userId, sessionId);
        requireMethodEnabled(session, method);
        StudentRecord student = resolveStudent(indexNumber, nfcUid, method);

        AttendanceRecord record = records.findBySessionIdAndStudentId(sessionId, student.id())
                .orElseGet(() -> {
                    AttendanceRecord r = new AttendanceRecord();
                    r.setSessionId(sessionId);
                    r.setStudentId(student.id());
                    return r;
                });
        if (record.getId() != null && record.getStatus() == AttendanceStatus.CHECKED_IN) {
            throw new ApiException(HttpStatus.CONFLICT, "Student already checked in");
        }
        record.setStatus(AttendanceStatus.CHECKED_IN);
        record.setMethod(method);
        record.setCheckedInBy(userId);
        record.setCheckedInAt(Instant.now());
        record.setRemovedBy(null);
        record.setRemovedAt(null);
        try {
            return AttendanceDto.from(records.saveAndFlush(record), student);
        } catch (DataIntegrityViolationException ex) {
            throw new ApiException(HttpStatus.CONFLICT, "Student already checked in");
        }
    }

    @Transactional
    public AttendanceDto remove(UUID userId, Long sessionId, Long attendanceId) {
        requireActiveMembership(userId, sessionId);
        AttendanceRecord record = require(sessionId, attendanceId);
        if (record.getStatus() == AttendanceStatus.REMOVED) {
            throw new ApiException(HttpStatus.CONFLICT, "Student already removed");
        }
        record.setStatus(AttendanceStatus.REMOVED);
        record.setRemovedBy(userId);
        record.setRemovedAt(Instant.now());
        return mapper.toDto(records.save(record));
    }

    @Transactional
    public AttendanceDto restore(UUID userId, Long sessionId, Long attendanceId) {
        requireActiveMembership(userId, sessionId);
        AttendanceRecord record = require(sessionId, attendanceId);
        if (record.getStatus() == AttendanceStatus.CHECKED_IN) {
            throw new ApiException(HttpStatus.CONFLICT, "Student is already checked in");
        }
        record.setStatus(AttendanceStatus.CHECKED_IN);
        record.setCheckedInBy(userId);
        record.setCheckedInAt(Instant.now());
        record.setRemovedBy(null);
        record.setRemovedAt(null);
        return mapper.toDto(records.save(record));
    }

    @Transactional(readOnly = true)
    public SessionSummaryDto summary(UUID userId, Long sessionId) {
        sessions.requireMember(userId, sessionId);
        return buildSummary(sessionId);
    }

    /** Admin report — no membership requirement (caller is role-gated). */
    @Transactional(readOnly = true)
    public SessionSummaryDto summaryForAdmin(Long sessionId) {
        sessions.require(sessionId);
        return buildSummary(sessionId);
    }

    private SessionSummaryDto buildSummary(Long sessionId) {
        List<AttendanceRecord> all = records.findBySessionIdOrderByCheckedInAtDesc(sessionId);
        long checkedIn = all.stream()
                .filter(r -> r.getStatus() == AttendanceStatus.CHECKED_IN)
                .count();
        long removed = all.size() - checkedIn;
        Map<String, Long> byMethod = all.stream()
                .filter(r -> r.getStatus() == AttendanceStatus.CHECKED_IN)
                .collect(Collectors.groupingBy(r -> r.getMethod().name(), Collectors.counting()));
        List<AttendanceRecord> recent = all.stream().limit(10).toList();
        return new SessionSummaryDto(checkedIn, removed, byMethod, mapper.toDtos(recent));
    }

    private ExamSession requireActiveMembership(UUID userId, Long sessionId) {
        return sessions.requireOngoingMember(userId, sessionId);
    }

    private StudentRecord resolveStudent(String indexNumber, String nfcUid, CheckInMethod method) {
        if (method == CheckInMethod.NFC) {
            if (nfcUid == null || nfcUid.isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "NFC card UID is required");
            }
            return directory
                    .findByNfcCode(NfcCodeNormalizer.normalize(nfcUid))
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No student matches this NFC card"));
        }
        if (indexNumber == null || indexNumber.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Student index number is required");
        }
        return directory
                .findByIndexNumber(indexNumber)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found: " + indexNumber));
    }

    private void requireMethodEnabled(ExamSession session, CheckInMethod method) {
        if (method == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Verification method is required");
        }
        if (method == CheckInMethod.QR) {
            return;
        }
        String configured = session.getVerificationMethods();
        boolean enabled = configured == null
                || List.of(configured.split(",")).stream().map(String::trim).anyMatch(method.name()::equals);
        if (!enabled) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN, method.name() + " verification is not enabled for this session");
        }
    }

    private AttendanceRecord require(Long sessionId, Long attendanceId) {
        AttendanceRecord record = records.findById(attendanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Attendance record not found"));
        if (!record.getSessionId().equals(sessionId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Attendance record not in this session");
        }
        return record;
    }
}
