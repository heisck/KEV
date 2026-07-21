package com.kev.backend.report;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kev.backend.auth.Role;
import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.directory.DirectoryStudent;
import com.kev.backend.directory.DirectoryStudentRepository;
import com.kev.backend.directory.FeesStatus;
import com.kev.backend.notification.NotificationRepository;
import com.kev.backend.report.dto.CreateStudentReportRequest;
import com.kev.backend.report.dto.StudentReportDto;
import com.kev.backend.session.ExamSession;
import com.kev.backend.session.SessionService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    StudentReportRepository reports;

    @Mock
    StudentReportReadRepository reads;

    @Mock
    DirectoryStudentRepository students;

    @Mock
    UserRepository users;

    @Mock
    NotificationRepository notifications;

    @Mock
    SessionService sessions;

    @InjectMocks
    ReportService service;

    private final UUID authorId = UUID.randomUUID();
    private final UUID colleagueId = UUID.randomUUID();
    private ExamSession session;
    private DirectoryStudent student;
    private User author;

    @BeforeEach
    void setUp() {
        session = new ExamSession();
        session.setId(2L);
        session.setTitle("Algorithms");
        session.setSessionCode("KEV-ABCD");
        session.setCreatedBy(authorId);
        student = new DirectoryStudent();
        student.setId(7L);
        student.setIndexNumber("10953001");
        student.setFullName("Ama Boateng");
        student.setProgramme("BSc Computer Science");
        student.setLevel((short) 300);
        student.setPhotoUrl("photo");
        student.setFeesStatus(FeesStatus.PAID);
        author = new User();
        author.setId(authorId);
        author.setEmail("lecturer@example.com");
        author.setDisplayName("Rebecca Mensah");
    }

    @Test
    void createSharesReportWithSessionInvigilatorsAndMarksAuthorRead() {
        User colleague = lecturer(colleagueId, "colleague@example.com");
        when(sessions.requireVisible(2L)).thenReturn(session);
        when(students.findById(7L)).thenReturn(Optional.of(student));
        when(users.findById(authorId)).thenReturn(Optional.of(author));
        when(reports.save(any())).thenAnswer(invocation -> {
            StudentReport report = invocation.getArgument(0);
            report.setId(11L);
            return report;
        });
        when(users.findAllByRoleInAndActiveTrue(List.of(Role.LECTURER, Role.ADMIN)))
                .thenReturn(List.of(author, colleague));

        StudentReportDto result =
                service.create(authorId, new CreateStudentReportRequest(2L, 7L, "  ID card damaged  "));

        assertThat(result.message()).isEqualTo("ID card damaged");
        assertThat(result.read()).isTrue();
        verify(reads).save(any(StudentReportRead.class));
        verify(notifications).saveAll(any());
    }

    @Test
    void listSharesReportsAcrossLecturerAccountsWithIndependentReadReceipts() {
        StudentReport report = report();
        when(reports.findAllVisible()).thenReturn(List.of(report));
        when(reads.findReadReportIds(colleagueId, List.of(11L))).thenReturn(List.of());

        List<StudentReportDto> result = service.list(colleagueId);

        assertThat(result).singleElement().satisfies(item -> {
            assertThat(item.student().indexNumber()).isEqualTo("10953001");
            assertThat(item.read()).isFalse();
        });
    }

    @Test
    void listKeepsAuthoredReportsReadForTheirAuthor() {
        StudentReport report = report();
        when(reports.findAllVisible()).thenReturn(List.of(report));
        when(reads.findReadReportIds(authorId, List.of(11L))).thenReturn(List.of(11L));

        List<StudentReportDto> result = service.list(authorId);

        assertThat(result).singleElement().satisfies(item -> assertThat(item.read())
                .isTrue());
    }

    @Test
    void createAllowsGeneralSessionReportWithoutStudent() {
        when(sessions.requireVisible(2L)).thenReturn(session);
        when(users.findById(authorId)).thenReturn(Optional.of(author));
        when(reports.save(any())).thenAnswer(invocation -> {
            StudentReport report = invocation.getArgument(0);
            report.setId(13L);
            return report;
        });
        when(users.findAllByRoleInAndActiveTrue(List.of(Role.LECTURER, Role.ADMIN)))
                .thenReturn(List.of(author));

        StudentReportDto result =
                service.create(authorId, new CreateStudentReportRequest(2L, null, "Room temperature is too high"));

        assertThat(result.student()).isNull();
        assertThat(result.message()).isEqualTo("Room temperature is too high");
    }

    @Test
    void markAllReadOnlyCreatesMissingReceipts() {
        StudentReport first = report();
        StudentReport second = report();
        second.setId(12L);
        when(reports.findAllVisible()).thenReturn(List.of(first, second));
        when(reads.findReadReportIds(colleagueId, List.of(11L, 12L))).thenReturn(List.of(11L));

        service.markAllRead(colleagueId);

        verify(reads).saveAll(any());
    }

    private User lecturer(UUID id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setRole(Role.LECTURER);
        user.setActive(true);
        return user;
    }

    private StudentReport report() {
        StudentReport report = new StudentReport();
        report.setId(11L);
        report.setSession(session);
        report.setStudent(student);
        report.setAuthor(author);
        report.setMessage("ID card damaged");
        return report;
    }
}
