package com.kev.backend.report;

import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.common.EntityUtils;
import com.kev.backend.directory.DirectoryStudent;
import com.kev.backend.directory.DirectoryStudentRepository;
import com.kev.backend.directory.dto.StudentRecord;
import com.kev.backend.notification.Notification;
import com.kev.backend.notification.NotificationRepository;
import com.kev.backend.report.dto.CreateStudentReportRequest;
import com.kev.backend.report.dto.StudentReportDto;
import com.kev.backend.session.ExamSession;
import com.kev.backend.session.SessionInvigilatorRepository;
import com.kev.backend.session.SessionService;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private final StudentReportRepository reports;
    private final StudentReportReadRepository reads;
    private final DirectoryStudentRepository students;
    private final UserRepository users;
    private final NotificationRepository notifications;
    private final SessionService sessions;
    private final SessionInvigilatorRepository invigilators;

    public ReportService(
            StudentReportRepository reports,
            StudentReportReadRepository reads,
            DirectoryStudentRepository students,
            UserRepository users,
            NotificationRepository notifications,
            SessionService sessions,
            SessionInvigilatorRepository invigilators) {
        this.reports = reports;
        this.reads = reads;
        this.students = students;
        this.users = users;
        this.notifications = notifications;
        this.sessions = sessions;
        this.invigilators = invigilators;
    }

    @Transactional
    public StudentReportDto create(UUID userId, CreateStudentReportRequest request) {
        ExamSession session = (request.sessionId() != null && request.sessionId() > 0)
                ? sessions.find(request.sessionId()).orElse(null)
                : null;
        DirectoryStudent student = request.studentId() != null
                ? EntityUtils.requireNonNull(students.findById(request.studentId()), "Student not found")
                : null;
        User author = requireUser(userId);
        StudentReport report = new StudentReport();
        report.setSession(session);
        report.setStudent(student);
        report.setAuthor(author);
        report.setMessage(request.message().trim());
        StudentReport saved = reports.save(report);
        reads.save(receipt(saved.getId(), userId));
        notifyInvigilators(saved, userId);
        return toDto(saved, true);
    }

    @Transactional(readOnly = true)
    public List<StudentReportDto> list(UUID userId) {
        List<StudentReport> visible = reports.findAllVisible();
        if (visible.isEmpty()) return List.of();
        List<Long> ids = visible.stream().map(r -> r.getId()).toList();
        Set<Long> readIds = new HashSet<>(reads.findReadReportIds(userId, ids));
        return visible.stream()
                .map(report -> toDto(report, readIds.contains(report.getId())))
                .toList();
    }

    @Transactional
    public void markRead(UUID userId, Long reportId) {
        requireReport(reportId);
        if (!reads.existsByReportIdAndUserId(reportId, userId)) {
            reads.save(receipt(reportId, userId));
        }
    }

    @Transactional
    public void markAllRead(UUID userId) {
        List<StudentReport> visible = reports.findAllVisible();
        if (visible.isEmpty()) return;
        List<Long> ids = visible.stream().map(r -> r.getId()).toList();
        Set<Long> readIds = new HashSet<>(reads.findReadReportIds(userId, ids));
        List<StudentReportRead> missing = ids.stream()
                .filter(id -> !readIds.contains(id))
                .map(id -> receipt(id, userId))
                .toList();
        if (!missing.isEmpty()) reads.saveAll(missing);
    }

    private StudentReport requireReport(Long reportId) {
        return EntityUtils.requireNonNull(reports.findById(reportId), "Report not found");
    }

    private User requireUser(UUID userId) {
        return EntityUtils.requireNonNull(users.findById(userId), "User not found");
    }

    private StudentReportRead receipt(Long reportId, UUID userId) {
        StudentReportRead receipt = new StudentReportRead();
        receipt.setReportId(reportId);
        receipt.setUserId(userId);
        return receipt;
    }

    private void notifyInvigilators(StudentReport report, UUID authorId) {
        Set<UUID> recipientIds = new HashSet<>();
        if (report.getSession() != null && report.getSession().getCreatedBy() != null) {
            recipientIds.add(report.getSession().getCreatedBy());
        }
        if (report.getSession() != null && report.getSession().getId() != null) {
            var list = invigilators.findBySessionId(report.getSession().getId());
            if (list != null) {
                list.forEach(i -> recipientIds.add(i.getUserId()));
            }
        }
        List<Notification> items = recipientIds.stream()
                .filter(recipientId -> !recipientId.equals(authorId))
                .map(recipientId -> notification(report, recipientId))
                .toList();
        if (!items.isEmpty()) notifications.saveAll(items);
    }

    private Notification notification(StudentReport report, UUID userId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType("REPORT:" + report.getId());
        notification.setTitle(report.getStudent() != null ? "Student report" : "Session report");
        notification.setMessage(
                report.getStudent() != null
                        ? displayName(report.getAuthor()) + " reported "
                                + report.getStudent().getFullName() + " in " + sessionTitle(report.getSession())
                        : displayName(report.getAuthor()) + " added a report in " + sessionTitle(report.getSession()));
        return notification;
    }

    private StudentReportDto toDto(StudentReport report, boolean read) {
        User author = report.getAuthor();
        ExamSession session = report.getSession();
        return new StudentReportDto(
                report.getId(),
                session != null ? session.getId() : null,
                sessionTitle(session),
                session != null ? session.getSessionCode() : null,
                session != null ? session.getExamDate() : null,
                author != null ? author.getId() : null,
                author != null ? displayName(author) : "",
                author != null ? author.getEmail() : "",
                report.getStudent() != null ? StudentRecord.from(report.getStudent()) : null,
                report.getMessage(),
                report.getCreatedAt(),
                read);
    }

    private String displayName(User user) {
        if (user == null) return "";
        return user.getDisplayName() != null && !user.getDisplayName().isBlank()
                ? user.getDisplayName()
                : user.getEmail();
    }

    private String sessionTitle(ExamSession session) {
        if (session == null) return "Session";
        return session.getTitle() != null && !session.getTitle().isBlank()
                ? session.getTitle()
                : session.getSessionCode();
    }
}
