package com.kev.backend.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.kev.backend.auth.Plan;
import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.common.ApiException;
import com.kev.backend.session.ExamSession;
import com.kev.backend.session.SessionInvigilator;
import com.kev.backend.session.SessionInvigilatorRepository;
import com.kev.backend.session.SessionService;
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
class AdminServiceTest {

    @Mock
    UserRepository users;

    @Mock
    SessionInvigilatorRepository invigilators;

    @Mock
    SessionService sessions;

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
}
