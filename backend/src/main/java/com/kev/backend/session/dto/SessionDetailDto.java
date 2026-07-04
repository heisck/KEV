package com.kev.backend.session.dto;

import com.kev.backend.attendance.dto.AttendanceDto;
import java.util.List;

public record SessionDetailDto(SessionDto session, List<InvigilatorDto> invigilators, List<AttendanceDto> attendance) {}
