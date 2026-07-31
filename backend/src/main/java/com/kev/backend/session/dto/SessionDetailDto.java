package com.kev.backend.session.dto;

import com.kev.backend.attendance.dto.AttendanceDto;
import java.util.List;

/**
 * @param expectedStudents students synced for the session's index range. This is the real
 *     roster size, so it grows while the background sync runs and changes when the range is
 *     edited — never a placeholder.
 */
public record SessionDetailDto(
        SessionDto session, List<InvigilatorDto> invigilators, List<AttendanceDto> attendance, long expectedStudents) {}
