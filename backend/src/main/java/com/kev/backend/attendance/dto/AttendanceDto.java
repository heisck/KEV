package com.kev.backend.attendance.dto;

import com.kev.backend.attendance.AttendanceRecord;
import com.kev.backend.directory.dto.StudentRecord;
import java.time.Instant;

public record AttendanceDto(
        Long id, StudentRecord student, String method, String status, Instant checkedInAt, Instant removedAt) {

    public static AttendanceDto from(AttendanceRecord r, StudentRecord student) {
        return new AttendanceDto(
                r.getId(), student, r.getMethod().name(), r.getStatus().name(), r.getCheckedInAt(), r.getRemovedAt());
    }
}
