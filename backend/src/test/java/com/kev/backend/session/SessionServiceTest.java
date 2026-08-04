package com.kev.backend.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kev.backend.attendance.AttendanceMapper;
import com.kev.backend.attendance.AttendanceRecordRepository;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.common.ApiException;
import com.kev.backend.directory.uits.RosterIngestService;
import com.kev.backend.notification.SessionNotificationService;
import com.kev.backend.session.dto.CreateSessionRequest;
import com.kev.backend.session.dto.SessionDto;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
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

    @Mock
    SessionNotificationService sessionNotifications;

    @Mock
    RosterIngestService rosterIngest;

    @Mock
    com.kev.backend.directory.DirectoryStudentRepository students;

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
        verify(sessionNotifications).notifyLecturers(1L, "Session created", "JQB 12 is now available");
    }

    @Test
    void createSendsSessionTargetToEveryActiveLecturer() {
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

        verify(sessionNotifications).notifyLecturers(12L, "Session created", "Algorithms is now available");
    }

    @Test
    void createStartsObservableRosterIngestForAnIndexRange() {
        when(sessions.existsBySessionCode(any())).thenReturn(false);
        when(sessions.save(any())).thenAnswer(invocation -> {
            ExamSession session = invocation.getArgument(0);
            session.setId(15L);
            return session;
        });

        service.create(
                creator,
                new CreateSessionRequest(
                        "Algorithms",
                        "JQB",
                        "GF",
                        "12",
                        List.of("DCIT 301"),
                        "100",
                        "599",
                        null,
                        null,
                        null,
                        List.of("NFC", "MANUAL")));

        verify(rosterIngest).prepare(15L);
        verify(rosterIngest).ingestRangeAsync(15L, "100", "599", "session:15", false);
    }

    @Test
    void endSendsSessionTargetToEveryActiveLecturer() {
        ExamSession session = editableSession();
        session.setStatus(SessionStatus.ACTIVE);
        session.setTitle("Algorithms");
        when(sessions.findById(3L)).thenReturn(Optional.of(session));
        service.end(creator, 3L);

        verify(sessionNotifications).notifyLecturers(3L, "Session ended", "Algorithms has closed");
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
        when(sessions.findAllByOrderByStartedAtDesc()).thenReturn(List.of(joined, ongoing, discoverable));
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

    /** A new index range is a new set of students, so the roster has to be pulled again. */
    @Test
    void updateResyncsTheRosterWhenTheIndexRangeChanges() {
        ExamSession session = editableSession();
        session.setIndexRangeStart("20000001");
        session.setIndexRangeEnd("20000100");
        when(sessions.findById(3L)).thenReturn(Optional.of(session));
        when(sessions.save(session)).thenReturn(session);

        service.update(creator, 3L, updateRequest());

        verify(rosterIngest).prepare(3L);
        verify(rosterIngest).ingestRangeAsync(3L, "10000001", "10000100", "session:3", false);
    }

    @Test
    void updateLeavesTheRosterAloneWhenTheIndexRangeIsUnchanged() {
        ExamSession session = editableSession();
        session.setIndexRangeStart("10000001");
        session.setIndexRangeEnd("10000100");
        when(sessions.findById(3L)).thenReturn(Optional.of(session));
        when(sessions.save(session)).thenReturn(session);

        service.update(creator, 3L, updateRequestWithAllMethods());

        verify(rosterIngest, never())
                .ingestRangeAsync(
                        anyLong(), anyString(), anyString(), anyString(), org.mockito.ArgumentMatchers.anyBoolean());
    }

    @Test
    void createRejectsAnExamDateThatHasAlreadyPassed() {
        assertThatThrownBy(() ->
                        service.create(creator, scheduledRequest(LocalDate.now().minusDays(1), "09:00", "12:00")))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
        verify(sessions, never()).save(any());
    }

    /**
     * "Now" is a minute, not an instant: a request for a 13:58 start that arrives at 13:58:40
     * is on time. Seconds spent filling in the form must not reject it.
     */
    @Test
    void createAcceptsAStartTimeInsideTheCurrentMinute() {
        when(sessions.existsBySessionCode(any())).thenReturn(false);
        when(sessions.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        LocalTime thisMinute = LocalTime.now().truncatedTo(ChronoUnit.MINUTES);

        service.create(
                creator,
                scheduledRequest(
                        LocalDate.now(),
                        thisMinute.format(DateTimeFormatter.ofPattern("HH:mm")),
                        thisMinute.plusHours(2).format(DateTimeFormatter.ofPattern("HH:mm"))));

        verify(sessions).save(any());
    }

    @Test
    void createRejectsAnEndTimeThatIsNotAfterTheStart() {
        assertThatThrownBy(() ->
                        service.create(creator, scheduledRequest(LocalDate.now().plusDays(1), "12:00", "12:00")))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    /**
     * An exam that already started must stay editable; re-sending its own stored schedule is
     * not a request to move it into the past.
     */
    @Test
    void updateAcceptsAStoredScheduleThatHasAlreadyStarted() {
        ExamSession session = editableSession();
        session.setExamDate(LocalDate.now());
        session.setStartTime("00:01");
        session.setEndTime("23:59");
        when(sessions.findById(3L)).thenReturn(Optional.of(session));
        when(sessions.save(session)).thenReturn(session);

        service.update(creator, 3L, scheduledRequest(LocalDate.now(), "00:01", "23:59"));

        verify(sessions).save(session);
    }

    @Test
    void updateRejectsMovingAnExamOntoAPastDate() {
        ExamSession session = editableSession();
        session.setExamDate(LocalDate.now());
        session.setStartTime("00:01");
        when(sessions.findById(3L)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> service.update(
                        creator, 3L, scheduledRequest(LocalDate.now().minusDays(2), "09:00", "12:00")))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
        verify(sessions, never()).save(any());
    }

    private CreateSessionRequest scheduledRequest(LocalDate date, String start, String end) {
        return new CreateSessionRequest(
                "Algorithms", "JQB", "GF", "12", List.of("DCIT 301"), "100", "599", date, start, end, List.of("FACE"));
    }

    /** Retry must work off the stored range: ingest state does not survive a restart. */
    @Test
    void retryRosterReplaysTheStoredIndexRange() {
        ExamSession session = editableSession();
        session.setIndexRangeStart("100");
        session.setIndexRangeEnd("599");
        when(sessions.findById(3L)).thenReturn(Optional.of(session));

        service.retryRoster(creator, 3L);

        verify(rosterIngest).retry(3L, "100", "599", "session:3", true);
    }

    @Test
    void retryRosterRejectsASessionWithNoIndexRange() {
        when(sessions.findById(3L)).thenReturn(Optional.of(editableSession()));

        assertThatThrownBy(() -> service.retryRoster(creator, 3L))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.CONFLICT));
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

    private CreateSessionRequest updateRequestWithAllMethods() {
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
                List.of("FACE", "NFC", "MANUAL"));
    }
}
