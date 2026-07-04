package com.kev.backend.attendance.web;

import com.kev.backend.attendance.AttendanceService;
import com.kev.backend.attendance.dto.AttendanceDto;
import com.kev.backend.attendance.dto.CheckInRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sessions/{sessionId}/attendance")
@Tag(name = "Attendance", description = "Check students in and out of an exam session")
public class AttendanceController {

    private final AttendanceService attendance;

    public AttendanceController(AttendanceService attendance) {
        this.attendance = attendance;
    }

    @PostMapping
    public AttendanceDto checkIn(
            @AuthenticationPrincipal Jwt principal,
            @PathVariable Long sessionId,
            @Valid @RequestBody CheckInRequest request) {
        return attendance.checkIn(userId(principal), sessionId, request.indexNumber(), request.method());
    }

    @DeleteMapping("/{attendanceId}")
    public AttendanceDto remove(
            @AuthenticationPrincipal Jwt principal, @PathVariable Long sessionId, @PathVariable Long attendanceId) {
        return attendance.remove(userId(principal), sessionId, attendanceId);
    }

    @PostMapping("/{attendanceId}/restore")
    public AttendanceDto restore(
            @AuthenticationPrincipal Jwt principal, @PathVariable Long sessionId, @PathVariable Long attendanceId) {
        return attendance.restore(userId(principal), sessionId, attendanceId);
    }

    private static UUID userId(Jwt principal) {
        return UUID.fromString(principal.getSubject());
    }
}
