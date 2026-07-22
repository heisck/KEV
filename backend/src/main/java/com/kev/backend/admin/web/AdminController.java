package com.kev.backend.admin.web;

import com.kev.backend.admin.AdminService;
import com.kev.backend.admin.dto.AdminDashboardDto;
import com.kev.backend.admin.dto.AssignInvigilatorRequest;
import com.kev.backend.admin.dto.CreateAdminRequest;
import com.kev.backend.admin.dto.CreateLecturerRequest;
import com.kev.backend.admin.dto.UpdateLecturerRequest;
import com.kev.backend.attendance.AttendanceService;
import com.kev.backend.auth.dto.UserDto;
import com.kev.backend.session.dto.InvigilatorDto;
import com.kev.backend.session.dto.SessionDto;
import com.kev.backend.session.dto.SessionSummaryDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Invigilator assignment and session reports")
public class AdminController {

    private final AdminService admin;
    private final AttendanceService attendance;

    public AdminController(AdminService admin, AttendanceService attendance) {
        this.admin = admin;
        this.attendance = attendance;
    }

    @GetMapping("/dashboard")
    public AdminDashboardDto dashboard(@AuthenticationPrincipal Jwt principal) {
        return admin.getDashboard(UUID.fromString(principal.getSubject()));
    }

    @GetMapping("/admins")
    public List<UserDto> admins() {
        return admin.listAdmins();
    }

    @PostMapping("/admins")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createAdmin(@AuthenticationPrincipal Jwt principal, @Valid @RequestBody CreateAdminRequest req) {
        return admin.createAdmin(UUID.fromString(principal.getSubject()), req);
    }

    @GetMapping("/lecturers")
    public List<UserDto> lecturers() {
        return admin.listLecturers();
    }

    @PostMapping("/lecturers")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createLecturer(
            @AuthenticationPrincipal Jwt principal, @Valid @RequestBody CreateLecturerRequest req) {
        return admin.createLecturer(UUID.fromString(principal.getSubject()), req);
    }

    @PutMapping("/lecturers/{id}")
    public UserDto updateLecturer(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLecturerRequest req) {
        return admin.updateLecturer(UUID.fromString(principal.getSubject()), id, req);
    }

    @DeleteMapping("/lecturers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disableLecturer(@AuthenticationPrincipal Jwt principal, @PathVariable UUID id) {
        admin.disableLecturer(UUID.fromString(principal.getSubject()), id);
    }

    @GetMapping("/invigilators")
    public List<UserDto> invigilators() {
        return admin.listInvigilators();
    }

    @GetMapping("/sessions")
    public List<SessionDto> sessions() {
        return admin.listAllSessions();
    }

    @GetMapping("/sessions/{sessionId}/report")
    public SessionSummaryDto report(@AuthenticationPrincipal Jwt principal, @PathVariable Long sessionId) {
        return attendance.summaryForAdmin(sessionId);
    }

    @PostMapping("/sessions/{sessionId}/invigilators")
    public InvigilatorDto assign(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable Long sessionId,
            @Valid @RequestBody AssignInvigilatorRequest request) {
        return admin.assign(UUID.fromString(principal.getSubject()), sessionId, request.userId());
    }

    @DeleteMapping("/sessions/{sessionId}/invigilators/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unassign(
            @AuthenticationPrincipal Jwt principal, @PathVariable Long sessionId, @PathVariable UUID userId) {
        admin.unassign(UUID.fromString(principal.getSubject()), sessionId, userId);
    }
}
