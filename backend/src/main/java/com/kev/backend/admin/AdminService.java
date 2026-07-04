package com.kev.backend.admin;

import com.kev.backend.auth.Plan;
import com.kev.backend.auth.Role;
import com.kev.backend.auth.User;
import com.kev.backend.auth.UserRepository;
import com.kev.backend.auth.dto.UserDto;
import com.kev.backend.common.ApiException;
import com.kev.backend.session.ExamSession;
import com.kev.backend.session.SessionInvigilator;
import com.kev.backend.session.SessionInvigilatorRepository;
import com.kev.backend.session.SessionService;
import com.kev.backend.session.dto.InvigilatorDto;
import com.kev.backend.session.dto.SessionDto;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    static final int FREE_PLAN_ASSIGNMENT_LIMIT = 5;

    private final UserRepository users;
    private final SessionInvigilatorRepository invigilators;
    private final SessionService sessions;

    public AdminService(UserRepository users, SessionInvigilatorRepository invigilators, SessionService sessions) {
        this.users = users;
        this.invigilators = invigilators;
        this.sessions = sessions;
    }

    @Transactional(readOnly = true)
    public List<UserDto> listInvigilators() {
        return users.findAll().stream()
                .filter(u -> u.getRole() != Role.ADMIN)
                .map(UserDto::from)
                .toList();
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
                userId, target.getDisplayName(), target.getEmail(), target.getPictureUrl(), saved.getJoinedAt(), true);
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
