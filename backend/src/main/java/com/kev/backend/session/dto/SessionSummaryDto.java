package com.kev.backend.session.dto;

import com.kev.backend.attendance.dto.AttendanceDto;
import java.util.List;
import java.util.Map;

public record SessionSummaryDto(long checkedIn, long removed, Map<String, Long> byMethod, List<AttendanceDto> recent) {}
