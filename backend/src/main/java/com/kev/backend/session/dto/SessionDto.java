package com.kev.backend.session.dto;

import com.kev.backend.session.ExamSession;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

public record SessionDto(
        Long id,
        String sessionCode,
        String sessionPassword,
        String title,
        String building,
        String floor,
        String room,
        List<String> courseCodes,
        String indexRangeStart,
        String indexRangeEnd,
        LocalDate examDate,
        String startTime,
        String endTime,
        List<String> verificationMethods,
        String status,
        Instant startedAt,
        Instant endedAt,
        long checkedInCount,
        long invigilatorCount,
        boolean joined) {

    public static SessionDto from(
            ExamSession s, String status, long checkedInCount, long invigilatorCount, boolean joined) {
        String methods = s.getVerificationMethods() == null ? "FACE,NFC,MANUAL" : s.getVerificationMethods();
        return new SessionDto(
                s.getId(),
                s.getSessionCode(),
                joined ? (s.getSessionPassword() != null ? s.getSessionPassword() : s.getSessionCode()) : null,
                s.getTitle() != null
                        ? s.getTitle()
                        : (s.getBuilding() + " " + (s.getRoom() != null ? s.getRoom() : "")).trim(),
                s.getBuilding(),
                s.getFloor(),
                s.getRoom(),
                Arrays.stream((s.getCourseCodes() == null ? "" : s.getCourseCodes()).split(","))
                        .map(String::trim)
                        .filter(c -> !c.isEmpty())
                        .toList(),
                s.getIndexRangeStart(),
                s.getIndexRangeEnd(),
                s.getExamDate(),
                s.getStartTime(),
                s.getEndTime(),
                Arrays.stream(methods.split(","))
                        .map(String::trim)
                        .filter(m -> !m.isEmpty())
                        .toList(),
                status,
                s.getStartedAt(),
                s.getEndedAt(),
                checkedInCount,
                invigilatorCount,
                joined);
    }
}
