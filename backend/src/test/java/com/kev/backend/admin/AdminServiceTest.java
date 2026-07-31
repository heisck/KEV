package com.kev.backend.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kev.backend.admin.dto.CreateAdminRequest;
import com.kev.backend.admin.dto.CreateLecturerRequest;
import com.kev.backend.auth.Plan;
import com.kev.backend.auth.Role;
import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.auth.dto.UserDto;
import com.kev.backend.common.ApiException;
import com.kev.backend.notification.ArkeselSmsService;
import com.kev.backend.notification.EmailService;
import com.kev.backend.notification.NotificationRepository;
import com.kev.backend.session.ExamSession;
import com.kev.backend.session.SessionInvigilator;
import com.kev.backend.session.SessionInvigilatorRepository;
import com.kev.backend.session.SessionService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    UserRepository users;

    @Mock
    SessionInvigilatorRepository invigilators;

    @Mock
    SessionService sessions;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    ArkeselSmsService sms;

    @Mock
    EmailService email;

    @Mock
    NotificationRepository notifications;

    @InjectMocks
    AdminService service;

    private final UUID adminId = UUID.randomUUID();
    private final UUID targetId = UUID.randomUUID();
    private User admin;
    private User target;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(adminId);
        admin.setPlan(Plan.FREE);
        target = new User();
        target.setId(targetId);
        target.setEmail("invig@kev.app");
    }

    private void stubAssignHappyPath() {
        ExamSession session = new ExamSession();
        session.setId(1L);
        when(sessions.require(1L)).thenReturn(session);
        when(users.findById(adminId)).thenReturn(Optional.of(admin));
        when(users.findById(targetId)).thenReturn(Optional.of(target));
        when(invigilators.existsBySessionIdAndUserId(1L, targetId)).thenReturn(false);
    }

    @Test
    void freeAdminBlockedAtLimitWithUpgradeHint() {
        stubAssignHappyPath();
        when(invigilators.countActiveAssignmentsBy(adminId)).thenReturn((long) AdminService.FREE_PLAN_ASSIGNMENT_LIMIT);

        assertThatThrownBy(() -> service.assign(adminId, 1L, targetId))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> {
                    ApiException api = (ApiException) e;
                    assertThat(api.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(api.getProperties()).containsEntry("code", "plan-limit");
                    assertThat(api.getProperties()).containsKey("upgradeHint");
                });
    }

    @Test
    void freeAdminUnderLimitCanAssign() {
        stubAssignHappyPath();
        when(invigilators.countActiveAssignmentsBy(adminId))
                .thenReturn((long) AdminService.FREE_PLAN_ASSIGNMENT_LIMIT - 1);
        when(invigilators.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertThat(service.assign(adminId, 1L, targetId).assignedByAdmin()).isTrue();
    }

    @Test
    void premiumAdminBypassesLimit() {
        stubAssignHappyPath();
        admin.setPlan(Plan.PREMIUM);
        when(invigilators.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertThat(service.assign(adminId, 1L, targetId)).isNotNull();
    }

    @Test
    void unassignDeletesMembership() {
        SessionInvigilator membership = new SessionInvigilator();
        when(invigilators.findBySessionIdAndUserId(1L, targetId)).thenReturn(Optional.of(membership));

        service.unassign(adminId, 1L, targetId);
    }

    @Test
    void createsAdministratorAndEmailsTemporaryCredentials() {
        when(users.findByEmail("new.admin@kev.app")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encoded-password");
        when(users.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var created = service.createAdmin(
                adminId,
                new CreateAdminRequest(
                        "New", "Admin", " NEW.ADMIN@KEV.APP ", "new.admin.personal@gmail.com", "+233240000000"));

        assertThat(created.role()).isEqualTo(Role.ADMIN.name());
        assertThat(created.plan()).isEqualTo(Plan.PREMIUM.name());
        ArgumentCaptor<String> smsBody = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> emailBody = ArgumentCaptor.forClass(String.class);
        verify(sms).sendSms(org.mockito.ArgumentMatchers.eq("+233240000000"), smsBody.capture());
        verify(email)
                .send(
                        org.mockito.ArgumentMatchers.eq("new.admin.personal@gmail.com"),
                        org.mockito.ArgumentMatchers.eq("Your KEV Admin Credentials"),
                        emailBody.capture());
        assertThat(smsBody.getValue())
                .isEqualTo(emailBody.getValue())
                .contains("\n\nnew.admin@kev.app\n\n")
                .contains("Temporary password");
    }

    @Test
    void createsLecturerAndSendsMatchingCredentialsBySmsAndEmail() {
        when(users.findByEmail("lecturer@university.edu")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encoded-password");
        when(users.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.createLecturer(
                adminId,
                new CreateLecturerRequest(
                        "Dr. Ada Mensah", "LEC-042", "lecturer@university.edu", "ada@gmail.com", "+233240000000"));

        ArgumentCaptor<String> smsBody = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> emailBody = ArgumentCaptor.forClass(String.class);
        verify(sms).sendSms(org.mockito.ArgumentMatchers.eq("+233240000000"), smsBody.capture());
        verify(email)
                .send(
                        org.mockito.ArgumentMatchers.eq("ada@gmail.com"),
                        org.mockito.ArgumentMatchers.eq("Welcome to KEV Exam Verification"),
                        emailBody.capture());
        assertThat(emailBody.getValue())
                .isEqualTo(smsBody.getValue())
                .contains("\n\nlecturer@university.edu\n\n")
                .contains("Temporary password");
    }

    @Test
    void listsOnlyActiveAccountsCreatedByAdmins() {
        User lecturer = managedUser(Role.LECTURER, true, adminId);
        User administrator = managedUser(Role.ADMIN, true, adminId);
        when(users.findAllByRoleAndActiveTrueAndCreatedByAdminIsNotNull(Role.LECTURER))
                .thenReturn(List.of(lecturer));
        when(users.findAllByRoleAndActiveTrueAndCreatedByAdminIsNotNull(Role.ADMIN))
                .thenReturn(List.of(administrator));

        assertThat(service.listLecturers()).extracting(UserDto::id).containsExactly(lecturer.getId());
        assertThat(service.listAdmins()).extracting(UserDto::id).containsExactly(administrator.getId());
    }

    @Test
    void deactivatesAdminCreatedAccountsWithoutDeletingHistory() {
        User lecturer = managedUser(Role.LECTURER, true, adminId);
        User administrator = managedUser(Role.ADMIN, true, adminId);
        when(users.findById(lecturer.getId())).thenReturn(Optional.of(lecturer));
        when(users.findById(administrator.getId())).thenReturn(Optional.of(administrator));

        service.disableLecturer(adminId, lecturer.getId());
        service.disableAdmin(adminId, administrator.getId());

        assertThat(lecturer.isActive()).isFalse();
        assertThat(administrator.isActive()).isFalse();
        assertThat(lecturer.getStatus()).isEqualTo("DISABLED");
        assertThat(administrator.getStatus()).isEqualTo("DISABLED");
        verify(users).save(lecturer);
        verify(users).save(administrator);
    }

    @Test
    void adminCannotRemoveOwnAccount() {
        assertThatThrownBy(() -> service.disableAdmin(adminId, adminId))
                .isInstanceOf(ApiException.class)
                .satisfies(
                        error -> assertThat(((ApiException) error).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    private User managedUser(Role role, boolean active, UUID creatorId) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(UUID.randomUUID() + "@example.com");
        user.setRole(role);
        user.setActive(active);
        user.setCreatedByAdmin(creatorId);
        return user;
    }
}
