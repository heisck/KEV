package com.kev.backend.attendance;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.kev.backend.attendance.dto.AttendanceDto;
import com.kev.backend.common.ApiException;
import com.kev.backend.directory.FeesStatus;
import com.kev.backend.directory.UniversityDirectory;
import com.kev.backend.directory.dto.StudentRecord;
import com.kev.backend.session.ExamSession;
import com.kev.backend.session.SessionService;
import com.kev.backend.session.SessionStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    AttendanceRecordRepository records;

    @Mock
    UniversityDirectory directory;

    @Mock
    SessionService sessions;

    @Mock
    AttendanceMapper mapper;

    @InjectMocks
    AttendanceService service;

    private final UUID invigilator = UUID.randomUUID();
    private final StudentRecord student = new StudentRecord(
            7L, "10953001", "Ama Boateng", "BSc CS", 300, "url", true, FeesStatus.PAID, true, List.of());

    private ExamSession activeSession;

    @BeforeEach
    void setUp() {
        activeSession = new ExamSession();
        activeSession.setId(1L);
        activeSession.setStatus(SessionStatus.ACTIVE);
    }

    @Test
    void checkInCreatesRecord() {
        when(sessions.requireMember(invigilator, 1L)).thenReturn(activeSession);
        when(directory.findByIndexNumber("10953001")).thenReturn(Optional.of(student));
        when(records.findBySessionIdAndStudentId(1L, 7L)).thenReturn(Optional.empty());
        when(records.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AttendanceDto dto = service.checkIn(invigilator, 1L, "10953001", CheckInMethod.QR);

        assertThat(dto.status()).isEqualTo("CHECKED_IN");
        assertThat(dto.method()).isEqualTo("QR");
        assertThat(dto.student().indexNumber()).isEqualTo("10953001");
    }

    @Test
    void checkInConflictsWhenAlreadyCheckedIn() {
        when(sessions.requireMember(invigilator, 1L)).thenReturn(activeSession);
        when(directory.findByIndexNumber("10953001")).thenReturn(Optional.of(student));
        AttendanceRecord live = new AttendanceRecord();
        live.setId(5L);
        live.setStatus(AttendanceStatus.CHECKED_IN);
        when(records.findBySessionIdAndStudentId(1L, 7L)).thenReturn(Optional.of(live));

        assertThatThrownBy(() -> service.checkIn(invigilator, 1L, "10953001", CheckInMethod.NFC))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void checkInReactivatesRemovedRecord() {
        when(sessions.requireMember(invigilator, 1L)).thenReturn(activeSession);
        when(directory.findByIndexNumber("10953001")).thenReturn(Optional.of(student));
        AttendanceRecord removed = new AttendanceRecord();
        removed.setId(5L);
        removed.setSessionId(1L);
        removed.setStudentId(7L);
        removed.setStatus(AttendanceStatus.REMOVED);
        removed.setRemovedBy(invigilator);
        when(records.findBySessionIdAndStudentId(1L, 7L)).thenReturn(Optional.of(removed));
        when(records.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AttendanceDto dto = service.checkIn(invigilator, 1L, "10953001", CheckInMethod.MANUAL);

        assertThat(dto.status()).isEqualTo("CHECKED_IN");
        assertThat(removed.getRemovedBy()).isNull();
        assertThat(removed.getRemovedAt()).isNull();
    }

    @Test
    void checkInRejectsEndedSession() {
        activeSession.setStatus(SessionStatus.ENDED);
        when(sessions.requireMember(invigilator, 1L)).thenReturn(activeSession);

        assertThatThrownBy(() -> service.checkIn(invigilator, 1L, "10953001", CheckInMethod.QR))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void removeThenRestoreFlipsStatus() {
        when(sessions.requireMember(invigilator, 1L)).thenReturn(activeSession);
        AttendanceRecord record = new AttendanceRecord();
        record.setId(9L);
        record.setSessionId(1L);
        record.setMethod(CheckInMethod.QR);
        record.setStatus(AttendanceStatus.CHECKED_IN);
        when(records.findById(9L)).thenReturn(Optional.of(record));
        when(records.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toDto(any())).thenAnswer(inv -> AttendanceDto.from(inv.getArgument(0), student));

        AttendanceDto afterRemove = service.remove(invigilator, 1L, 9L);
        assertThat(afterRemove.status()).isEqualTo("REMOVED");

        AttendanceDto afterRestore = service.restore(invigilator, 1L, 9L);
        assertThat(afterRestore.status()).isEqualTo("CHECKED_IN");
    }

    @Test
    void removeRejectsRecordFromOtherSession() {
        when(sessions.requireMember(invigilator, 1L)).thenReturn(activeSession);
        AttendanceRecord record = new AttendanceRecord();
        record.setId(9L);
        record.setSessionId(99L);
        when(records.findById(9L)).thenReturn(Optional.of(record));

        assertThatThrownBy(() -> service.remove(invigilator, 1L, 9L))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
    }
}
