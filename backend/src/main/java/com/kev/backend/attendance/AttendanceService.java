package com.kev.backend.attendance;

import com.kev.backend.attendance.dto.AttendanceDto;
import com.kev.backend.common.ApiException;
import com.kev.backend.directory.UniversityDirectory;
import com.kev.backend.directory.dto.StudentRecord;
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
        requireActiveMembership(userId, sessionId);
        StudentRecord student = directory
                .findByIndexNumber(indexNumber)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found: " + indexNumber));

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

    private void requireActiveMembership(UUID userId, Long sessionId) {
        sessions.requireOngoingMember(userId, sessionId);
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
