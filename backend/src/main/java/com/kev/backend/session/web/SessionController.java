package com.kev.backend.session.web;

import com.kev.backend.attendance.AttendanceService;
import com.kev.backend.directory.uits.RosterIngestService;
import com.kev.backend.session.SessionRosterService;
import com.kev.backend.session.SessionService;
import com.kev.backend.session.dto.CreateSessionRequest;
import com.kev.backend.session.dto.JoinSessionRequest;
import com.kev.backend.session.dto.RosterStudentDto;
import com.kev.backend.session.dto.SessionDetailDto;
import com.kev.backend.session.dto.SessionDto;
import com.kev.backend.session.dto.SessionSummaryDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sessions")
@Tag(name = "Sessions", description = "Exam sessions: create, join by code, live view")
public class SessionController {

    private final SessionService sessions;
    private final AttendanceService attendance;
    private final SessionRosterService roster;

    public SessionController(SessionService sessions, AttendanceService attendance, SessionRosterService roster) {
        this.sessions = sessions;
        this.attendance = attendance;
        this.roster = roster;
    }

    @PostMapping
    public SessionDto create(@AuthenticationPrincipal Jwt principal, @Valid @RequestBody CreateSessionRequest request) {
        return sessions.create(userId(principal), request);
    }

    @PutMapping("/{id}")
    public SessionDto update(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable Long id,
            @Valid @RequestBody CreateSessionRequest request) {
        return sessions.update(userId(principal), id, request);
    }

    @GetMapping
    public List<SessionDto> list(@AuthenticationPrincipal Jwt principal) {
        return sessions.listForUser(userId(principal));
    }

    @GetMapping("/{id}")
    public SessionDetailDto detail(@AuthenticationPrincipal Jwt principal, @PathVariable Long id) {
        return sessions.detail(userId(principal), id);
    }

    @GetMapping("/{id}/roster-status")
    public RosterIngestService.Status rosterStatus(@AuthenticationPrincipal Jwt principal, @PathVariable Long id) {
        return sessions.rosterStatus(userId(principal), id);
    }

    @GetMapping("/{id}/roster")
    public List<RosterStudentDto> roster(@AuthenticationPrincipal Jwt principal, @PathVariable Long id) {
        return roster.roster(userId(principal), id);
    }

    @PostMapping("/{id}/roster-retry")
    public void retryRoster(@AuthenticationPrincipal Jwt principal, @PathVariable Long id) {
        sessions.retryRoster(userId(principal), id);
    }

    @PostMapping("/join")
    public SessionDto join(@AuthenticationPrincipal Jwt principal, @Valid @RequestBody JoinSessionRequest request) {
        return sessions.join(userId(principal), request.getEffectiveCodeOrPassword());
    }

    @PostMapping("/{id}/join")
    public SessionDto joinByPassword(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable Long id,
            @Valid @RequestBody JoinSessionRequest request) {
        return sessions.joinByPassword(userId(principal), id, request.getEffectiveCodeOrPassword());
    }

    @PostMapping("/{id}/end")
    public SessionDto end(@AuthenticationPrincipal Jwt principal, @PathVariable Long id) {
        return sessions.end(userId(principal), id);
    }

    @GetMapping("/{id}/summary")
    public SessionSummaryDto summary(@AuthenticationPrincipal Jwt principal, @PathVariable Long id) {
        return attendance.summary(userId(principal), id);
    }

    static UUID userId(Jwt principal) {
        return UUID.fromString(principal.getSubject());
    }
}
