package com.kev.backend.session.dto;

import com.kev.backend.session.ExamSession;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

public record SessionDto(
        Long id,
        String sessionCode,
        String building,
        String floor,
        String room,
        List<String> courseCodes,
        String indexRangeStart,
        String indexRangeEnd,
        String status,
        Instant startedAt,
        Instant endedAt,
        long checkedInCount,
        long invigilatorCount) {

    public static SessionDto from(ExamSession s, long checkedInCount, long invigilatorCount) {
        return new SessionDto(
                s.getId(),
                s.getSessionCode(),
                s.getBuilding(),
                s.getFloor(),
                s.getRoom(),
                Arrays.stream(s.getCourseCodes().split(","))
                        .map(String::trim)
                        .filter(c -> !c.isEmpty())
                        .toList(),
                s.getIndexRangeStart(),
                s.getIndexRangeEnd(),
                s.getStatus().name(),
                s.getStartedAt(),
                s.getEndedAt(),
                checkedInCount,
                invigilatorCount);
    }
}
