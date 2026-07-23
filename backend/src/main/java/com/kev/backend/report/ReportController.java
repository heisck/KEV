package com.kev.backend.report;

import com.kev.backend.report.dto.CreateStudentReportRequest;
import com.kev.backend.report.dto.StudentReportDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Student reports shared with session invigilators")
public class ReportController {

    private final ReportService reports;

    public ReportController(ReportService reports) {
        this.reports = reports;
    }

    @GetMapping
    public List<StudentReportDto> list(@AuthenticationPrincipal Jwt principal) {
        return reports.list(userId(principal));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentReportDto create(
            @AuthenticationPrincipal Jwt principal, @Valid @RequestBody CreateStudentReportRequest request) {
        return reports.create(userId(principal), request);
    }

    @PostMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@AuthenticationPrincipal Jwt principal, @PathVariable Long id) {
        reports.markRead(userId(principal), id);
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(@AuthenticationPrincipal Jwt principal) {
        reports.markAllRead(userId(principal));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        reports.delete(id);
    }

    private UUID userId(Jwt principal) {
        return UUID.fromString(principal.getSubject());
    }
}
