package com.kev.backend.admin;

import com.kev.backend.admin.dto.AdminDashboardDto;
import com.kev.backend.admin.dto.CreateAdminRequest;
import com.kev.backend.admin.dto.CreateLecturerRequest;
import com.kev.backend.admin.dto.UpdateLecturerRequest;
import com.kev.backend.auth.Plan;
import com.kev.backend.auth.Role;
import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.auth.dto.UserDto;
import com.kev.backend.common.ApiException;
import com.kev.backend.notification.ArkeselSmsService;
import com.kev.backend.notification.EmailService;
import com.kev.backend.notification.Notification;
import com.kev.backend.notification.NotificationRepository;
import com.kev.backend.session.ExamSession;
import com.kev.backend.session.SessionInvigilator;
import com.kev.backend.session.SessionInvigilatorRepository;
import com.kev.backend.session.SessionService;
import com.kev.backend.session.dto.InvigilatorDto;
import com.kev.backend.session.dto.SessionDto;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    static final int FREE_PLAN_ASSIGNMENT_LIMIT = 500;

    private final UserRepository users;
    private final SessionInvigilatorRepository invigilators;
    private final SessionService sessions;
    private final PasswordEncoder passwordEncoder;
    private final ArkeselSmsService arkesel;
    private final EmailService email;
    private final NotificationRepository notifications;

    public AdminService(
            UserRepository users,
            SessionInvigilatorRepository invigilators,
            SessionService sessions,
            PasswordEncoder passwordEncoder,
            ArkeselSmsService arkesel,
            EmailService email,
            NotificationRepository notifications) {
        this.users = users;
        this.invigilators = invigilators;
        this.sessions = sessions;
        this.passwordEncoder = passwordEncoder;
        this.arkesel = arkesel;
        this.email = email;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<UserDto> listInvigilators() {
        return users.findAll().stream()
                .filter(u -> u.getRole() == Role.LECTURER || u.getRole() == Role.USER)
                .map(UserDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserDto> listLecturers() {
        return listManagedUsers(Role.LECTURER);
    }

    @Transactional(readOnly = true)
    public List<UserDto> listAdmins() {
        return listManagedUsers(Role.ADMIN);
    }

    private List<UserDto> listManagedUsers(Role role) {
        return users.findAllByRoleAndActiveTrueAndCreatedByAdminIsNotNull(role).stream()
                .map(UserDto::from)
                .toList();
    }

    @Transactional
    public UserDto createAdmin(UUID creatorAdminId, CreateAdminRequest req) {
        String adminEmail = req.email().trim().toLowerCase(Locale.ROOT);
        if (users.findByEmail(adminEmail).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "User with email already exists");
        }

        String randomPassword = UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        User created = new User();
        created.setEmail(adminEmail);
        created.setPersonalEmail(req.personalEmail().trim().toLowerCase(Locale.ROOT));
        created.setDisplayName((req.firstName().trim() + " " + req.lastName().trim()).strip());
        created.setRole(Role.ADMIN);
        created.setPlan(Plan.PREMIUM);
        created.setPasswordHash(passwordEncoder.encode(randomPassword));
        created.setPhone(
                req.phone() == null || req.phone().isBlank()
                        ? null
                        : req.phone().trim());
        created.setStatus("ACTIVE");
        created.setActive(true);
        created.setCreatedByAdmin(creatorAdminId);
        User saved = users.save(created);

        String credentials = credentialMessage(
                "Welcome to KEV (Admin).", saved.getEmail(), randomPassword, "Download the app to sign in.");
        if (saved.getPhone() != null) arkesel.sendSms(saved.getPhone(), credentials);
        email.send(saved.getPersonalEmail(), "Your KEV Admin Credentials", credentials);
        notifyAdminCreated(saved);
        return UserDto.from(saved);
    }

    private void notifyAdminCreated(User saved) {
        Notification notification = new Notification();
        notification.setUserId(saved.getId());
        notification.setTitle("Admin Account Created");
        notification.setMessage("Welcome to KEV! Your credentials have been sent to your email.");
        notifications.save(notification);
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboard(UUID adminId) {
        List<User> all = users.findAll();
        long totalLecturers =
                all.stream().filter(u -> u.getRole() == Role.LECTURER).count();
        long activeLecturers = all.stream()
                .filter(u -> u.getRole() == Role.LECTURER && u.isActive() && "ACTIVE".equalsIgnoreCase(u.getStatus()))
                .count();
        List<SessionDto> allSessions = sessions.listAll();
        return new AdminDashboardDto(
                totalLecturers,
                activeLecturers,
                allSessions.size(),
                allSessions.stream().limit(10).toList(),
                all.stream()
                        .filter(u -> u.getRole() == Role.LECTURER)
                        .limit(10)
                        .map(UserDto::from)
                        .toList());
    }

    @Transactional
    public UserDto createLecturer(UUID adminId, CreateLecturerRequest req) {
        if (users.findByEmail(req.universityEmail().trim()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "User with email already exists");
        }
        User lecturer = new User();
        lecturer.setEmail(req.universityEmail().trim());
        lecturer.setDisplayName(req.fullName().trim());
        lecturer.setRole(Role.LECTURER);
        lecturer.setPlan(Plan.FREE);
        lecturer.setLecturerId(req.lecturerId().trim());
        lecturer.setPersonalEmail(req.personalEmail().trim());
        lecturer.setPhone(req.phone().trim());
        lecturer.setStatus("ACTIVE");
        lecturer.setActive(true);
        lecturer.setCreatedByAdmin(adminId);

        String randomPassword = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        lecturer.setPasswordHash(passwordEncoder.encode(randomPassword));
        User saved = users.save(lecturer);

        String smsMsg = credentialMessage(
                "Welcome to Exam Verification.", saved.getEmail(), randomPassword, "Download the app.");
        arkesel.sendSms(saved.getPhone(), smsMsg);
        email.send(saved.getPersonalEmail(), "Welcome to KEV Exam Verification", smsMsg);

        Notification n = new Notification();
        n.setUserId(saved.getId());
        n.setTitle("Account Created");
        n.setMessage("Welcome to KEV! Your temporary password has been sent to your email and phone.");
        notifications.save(n);

        return UserDto.from(saved);
    }

    private String credentialMessage(String greeting, String loginEmail, String password, String closing) {
        return greeting + "\nLogin email\n\n" + loginEmail + "\n\nTemporary password\n" + password + "\n" + closing;
    }

    @Transactional
    public UserDto updateLecturer(UUID adminId, UUID userId, UpdateLecturerRequest req) {
        User target =
                users.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Lecturer not found"));
        target.setDisplayName(req.fullName().trim());
        target.setLecturerId(req.lecturerId().trim());
        target.setEmail(req.universityEmail().trim());
        target.setPersonalEmail(req.personalEmail().trim());
        target.setPhone(req.phone().trim());
        if (req.status() != null) target.setStatus(req.status());
        if (req.active() != null) target.setActive(req.active());
        return UserDto.from(users.save(target));
    }

    @Transactional
    public void disableLecturer(UUID adminId, UUID userId) {
        disableManagedUser(userId, Role.LECTURER, "Lecturer");
    }

    @Transactional
    public void disableAdmin(UUID adminId, UUID userId) {
        if (adminId.equals(userId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot remove your own administrator account");
        }
        disableManagedUser(userId, Role.ADMIN, "Administrator");
    }

    private void disableManagedUser(UUID userId, Role role, String label) {
        User target = users.findById(userId)
                .filter(user -> user.getRole() == role && user.getCreatedByAdmin() != null)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, label + " not found"));
        target.setStatus("DISABLED");
        target.setActive(false);
        users.save(target);
    }

    @Transactional(readOnly = true)
    public List<SessionDto> listAllSessions() {
        return sessions.listAll();
    }

    @Transactional
    public InvigilatorDto assign(UUID adminId, Long sessionId, UUID userId) {
        ExamSession session = sessions.require(sessionId);
        User admin = users.findById(adminId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Admin account not found"));
        User target =
                users.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (invigilators.existsBySessionIdAndUserId(sessionId, userId)) {
            throw new ApiException(HttpStatus.CONFLICT, "User is already an invigilator of this session");
        }
        enforcePlanLimit(admin);

        SessionInvigilator membership = new SessionInvigilator();
        membership.setSessionId(session.getId());
        membership.setUserId(userId);
        membership.setAssignedBy(adminId);
        SessionInvigilator saved = invigilators.save(membership);
        return new InvigilatorDto(
                userId,
                target.getDisplayName(),
                target.getEmail(),
                target.getPictureUrl(),
                saved.getJoinedAt(),
                true,
                saved.getRole());
    }

    @Transactional
    public void unassign(UUID adminId, Long sessionId, UUID userId) {
        SessionInvigilator membership = invigilators
                .findBySessionIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Assignment not found"));
        invigilators.delete(membership);
    }

    private void enforcePlanLimit(User admin) {
        if (admin.getPlan() == Plan.PREMIUM) {
            return;
        }
        long active = invigilators.countActiveAssignmentsBy(admin.getId());
        if (active >= FREE_PLAN_ASSIGNMENT_LIMIT) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Free plan allows up to " + FREE_PLAN_ASSIGNMENT_LIMIT + " invigilator assignments",
                    Map.of(
                            "code", "plan-limit",
                            "limit", FREE_PLAN_ASSIGNMENT_LIMIT,
                            "upgradeHint", "Upgrade to Premium for unlimited invigilator assignments"));
        }
    }
}
