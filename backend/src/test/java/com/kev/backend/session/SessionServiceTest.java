package com.kev.backend.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.kev.backend.attendance.AttendanceMapper;
import com.kev.backend.attendance.AttendanceRecordRepository;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.common.ApiException;
import com.kev.backend.session.dto.CreateSessionRequest;
import com.kev.backend.session.dto.SessionDto;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    ExamSessionRepository sessions;

    @Mock
    SessionInvigilatorRepository invigilators;

    @Mock
    AttendanceRecordRepository attendance;

    @Mock
    UserRepository users;

    @Mock
    AttendanceMapper attendanceMapper;

    @InjectMocks
    SessionService service;

    private final UUID creator = UUID.randomUUID();

    @Test
    void createGeneratesKevCodeAndAddsCreatorAsMember() {
        when(sessions.existsBySessionCode(any())).thenReturn(false);
        when(sessions.save(any())).thenAnswer(inv -> {
            ExamSession s = inv.getArgument(0);
            s.setId(1L);
            return s;
        });
        when(invigilators.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SessionDto dto = service.create(
                creator,
                new CreateSessionRequest(
                        null, "JQB", "GF", "12", List.of("DCIT 301", "DCIT 305"), null, null, null, null, null, null));

        assertThat(dto.sessionCode()).matches("KEV-[2-9A-HJKMNP-Z]{4}");
        assertThat(dto.courseCodes()).containsExactly("DCIT 301", "DCIT 305");
        // No exam date set → treated as UPCOMING (unscheduled, just created).
        assertThat(dto.status()).isEqualTo("UPCOMING");
    }

    @Test
    void joinRejectsEndedSession() {
        ExamSession ended = new ExamSession();
        ended.setId(2L);
        ended.setStatus(SessionStatus.ENDED);
        when(sessions.findBySessionCode("KEV-ABCD")).thenReturn(Optional.of(ended));

        assertThatThrownBy(() -> service.join(creator, "kev-abcd"))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void endRejectsNonCreator() {
        ExamSession session = new ExamSession();
        session.setId(3L);
        session.setCreatedBy(creator);
        when(sessions.findById(3L)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> service.end(UUID.randomUUID(), 3L))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void requireMemberRejectsOutsider() {
        ExamSession session = new ExamSession();
        session.setId(4L);
        session.setCreatedBy(creator);
        when(sessions.findById(4L)).thenReturn(Optional.of(session));
        when(invigilators.existsBySessionIdAndUserId(any(), any())).thenReturn(false);

        assertThatThrownBy(() -> service.requireMember(UUID.randomUUID(), 4L)).isInstanceOf(ApiException.class);
    }
}
