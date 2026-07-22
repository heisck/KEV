package com.kev.backend.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kev.backend.attendance.AttendanceMapper;
import com.kev.backend.attendance.AttendanceRecordRepository;
import com.kev.backend.auth.Role;
import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.common.ApiException;
import com.kev.backend.notification.Notification;
import com.kev.backend.notification.NotificationRepository;
import com.kev.backend.session.dto.CreateSessionRequest;
import com.kev.backend.session.dto.SessionDto;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
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

    @Mock
    NotificationRepository notifications;

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
        assertThat(dto.sessionPassword()).matches("[2-9A-HJKMNP-Z]{6}");
        assertThat(dto.courseCodes()).containsExactly("DCIT 301", "DCIT 305");
        // No exam date set → treated as UPCOMING (unscheduled, just created).
        assertThat(dto.status()).isEqualTo("UPCOMING");
        verify(users).findAllByRoleInAndActiveTrue(any());
    }

    @Test
    void createSendsSessionTargetToEveryActiveLecturer() {
        UUID lecturerId = UUID.randomUUID();
        User lecturer = new User();
        lecturer.setId(lecturerId);
        lecturer.setRole(Role.LECTURER);
        lecturer.setActive(true);
        when(users.findAllByRoleInAndActiveTrue(List.of(Role.LECTURER, Role.ADMIN)))
                .thenReturn(List.of(lecturer));
        when(sessions.existsBySessionCode(any())).thenReturn(false);
        when(sessions.save(any())).thenAnswer(invocation -> {
            ExamSession session = invocation.getArgument(0);
            session.setId(12L);
            return session;
        });

        service.create(
                creator,
                new CreateSessionRequest(
                        "Algorithms", "JQB", "GF", "12", List.of("DCIT 301"), null, null, null, null, null, null));

        ArgumentCaptor<Iterable<Notification>> captor = ArgumentCaptor.captor();
        verify(notifications).saveAll(captor.capture());
        assertThat(captor.getValue()).singleElement().satisfies(notification -> {
            assertThat(notification.getUserId()).isEqualTo(lecturerId);
            assertThat(notification.getTitle()).isEqualTo("Session created");
            assertThat(notification.getType()).isEqualTo("SESSION:12");
        });
    }

    @Test
    void endSendsSessionTargetToEveryActiveLecturer() {
        UUID lecturerId = UUID.randomUUID();
        User lecturer = new User();
        lecturer.setId(lecturerId);
        ExamSession session = editableSession();
        session.setStatus(SessionStatus.ACTIVE);
        session.setTitle("Algorithms");
        when(sessions.findById(3L)).thenReturn(Optional.of(session));
        when(users.findAllByRoleInAndActiveTrue(List.of(Role.LECTURER, Role.ADMIN)))
                .thenReturn(List.of(lecturer));

        service.end(creator, 3L);

        ArgumentCaptor<Iterable<Notification>> captor = ArgumentCaptor.captor();
        verify(notifications).saveAll(captor.capture());
        assertThat(captor.getValue()).singleElement().satisfies(notification -> {
            assertThat(notification.getUserId()).isEqualTo(lecturerId);
            assertThat(notification.getTitle()).isEqualTo("Session ended");
            assertThat(notification.getMessage()).isEqualTo("Algorithms has closed");
            assertThat(notification.getType()).isEqualTo("SESSION:3");
        });
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
    void joinRejectsSessionWhoseScheduledTimeHasPassed() {
        ExamSession completed = editableSession();
        completed.setExamDate(LocalDate.now().minusDays(1));
        when(sessions.findBySessionCode("KEV-ABCD")).thenReturn(Optional.of(completed));

        assertThatThrownBy(() -> service.join(creator, "KEV-ABCD"))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void joinByIdRequiresTheMatchingSessionPassword() {
        ExamSession session = editableSession();
        when(sessions.findById(3L)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> service.joinByPassword(creator, 3L, "wrong"))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void listIncludesFutureOngoingAndPastSessionsButHidesCredentialsUntilJoined() {
        ExamSession joined = editableSession();
        ExamSession discoverable = editableSession();
        discoverable.setId(4L);
        discoverable.setCreatedBy(UUID.randomUUID());
        discoverable.setSessionCode("KEV-WXYZ");
        discoverable.setSessionPassword("ABC789");
        discoverable.setExamDate(LocalDate.now().minusDays(1));
        ExamSession ongoing = editableSession();
        ongoing.setId(5L);
        ongoing.setCreatedBy(UUID.randomUUID());
        ongoing.setStatus(SessionStatus.ACTIVE);
        when(sessions.findAll(any(Sort.class))).thenReturn(List.of(joined, ongoing, discoverable));
        when(invigilators.findSessionIdsByUserId(creator)).thenReturn(List.of(3L));
        when(attendance.countCheckedInBySessionIds(List.of(3L, 5L, 4L))).thenReturn(List.of());
        when(invigilators.countBySessionIds(List.of(3L, 5L, 4L))).thenReturn(List.of());

        List<SessionDto> result = service.listForUser(creator);

        assertThat(result).extracting(SessionDto::id).containsExactly(3L, 5L, 4L);
        assertThat(result.get(0).joined()).isTrue();
        assertThat(result.get(0).sessionPassword()).isEqualTo("F7K9PX");
        assertThat(result.get(1).joined()).isFalse();
        assertThat(result.get(1).sessionPassword()).isNull();
        assertThat(result.get(2).joined()).isFalse();
        assertThat(result.get(2).sessionPassword()).isNull();
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
    void updateChangesEditableFieldsWithoutReplacingCredentials() {
        ExamSession session = new ExamSession();
        session.setId(3L);
        session.setCreatedBy(creator);
        session.setSessionCode("KEV-ABCD");
        session.setSessionPassword("F7K9PX");
        when(sessions.findById(3L)).thenReturn(Optional.of(session));
        when(sessions.save(session)).thenReturn(session);

        SessionDto dto = service.update(
                creator,
                3L,
                new CreateSessionRequest(
                        "Updated class",
                        "New Building",
                        "Floor 2",
                        "18",
                        List.of("DCIT 401", "DCIT 403"),
                        "10000001",
                        "10000100",
                        null,
                        "09:00",
                        "12:00",
                        List.of("NFC", "MANUAL")));

        assertThat(dto.sessionCode()).isEqualTo("KEV-ABCD");
        assertThat(dto.sessionPassword()).isEqualTo("F7K9PX");
        assertThat(dto.building()).isEqualTo("New Building");
        assertThat(dto.indexRangeStart()).isEqualTo("10000001");
        assertThat(dto.verificationMethods()).containsExactly("NFC", "MANUAL");
    }

    @Test
    void updateAllowsInvigilatorMembership() {
        UUID member = UUID.randomUUID();
        ExamSession session = editableSession();
        when(sessions.findById(3L)).thenReturn(Optional.of(session));
        when(invigilators.existsBySessionIdAndUserId(3L, member)).thenReturn(true);
        when(sessions.save(session)).thenReturn(session);

        SessionDto dto = service.update(member, 3L, updateRequest());

        assertThat(dto.building()).isEqualTo("New Building");
    }

    @Test
    void updateRejectsNonMember() {
        ExamSession session = editableSession();
        when(sessions.findById(3L)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> service.update(UUID.randomUUID(), 3L, updateRequest()))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void requireOngoingMemberExplainsUpcomingAndCompletedSessions() {
        ExamSession session = editableSession();
        session.setExamDate(LocalDate.now().plusDays(1));
        when(sessions.findById(3L)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> service.requireOngoingMember(creator, 3L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not started");

        session.setExamDate(LocalDate.now().minusDays(1));
        assertThatThrownBy(() -> service.requireOngoingMember(creator, 3L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("closed");
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

    @Test
    void requireVisibleAllowsPastSessionWithoutMembership() {
        ExamSession session = editableSession();
        session.setCreatedBy(creator);
        session.setExamDate(LocalDate.now().minusDays(1));
        when(sessions.findById(3L)).thenReturn(Optional.of(session));

        assertThat(service.requireVisible(3L)).isSameAs(session);
    }

    private ExamSession editableSession() {
        ExamSession session = new ExamSession();
        session.setId(3L);
        session.setCreatedBy(creator);
        session.setSessionCode("KEV-ABCD");
        session.setSessionPassword("F7K9PX");
        return session;
    }

    private CreateSessionRequest updateRequest() {
        return new CreateSessionRequest(
                "Updated class",
                "New Building",
                "Floor 2",
                "18",
                List.of("DCIT 401"),
                "10000001",
                "10000100",
                null,
                "09:00",
                "12:00",
                List.of("NFC"));
    }
}
