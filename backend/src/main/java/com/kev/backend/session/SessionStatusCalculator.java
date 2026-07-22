package com.kev.backend.session;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Derives the user-facing session status from its schedule and stored state.
 *
 * <p>A creator can force a terminal state (ended/cancelled); otherwise the
 * status is computed from {@code examDate} + start/end times relative to now:
 * before start → UPCOMING, within the window → ONGOING, after end → COMPLETED.
 * Sessions without a date are treated as UPCOMING (just created, unscheduled).
 */
final class SessionStatusCalculator {

    private SessionStatusCalculator() {}

    static SessionStatus resolve(ExamSession s, LocalDateTime now) {
        SessionStatus stored = s.getStatus();
        if (stored == SessionStatus.CANCELLED) {
            return SessionStatus.CANCELLED;
        }
        if (stored == SessionStatus.ENDED || stored == SessionStatus.COMPLETED) {
            return SessionStatus.COMPLETED;
        }

        LocalDate date = s.getExamDate();
        if (date == null) {
            return SessionStatus.UPCOMING;
        }

        LocalTime start = parseTime(s.getStartTime());
        LocalTime end = parseTime(s.getEndTime());
        LocalDateTime startAt = date.atTime(start != null ? start : LocalTime.MIN);
        LocalDateTime endAt = date.atTime(end != null ? end : LocalTime.MAX);

        if (now.isBefore(startAt)) {
            return SessionStatus.UPCOMING;
        }
        if (now.isAfter(endAt)) {
            return SessionStatus.COMPLETED;
        }
        return SessionStatus.ONGOING;
    }

    private static final java.time.format.DateTimeFormatter TIME_FORMATTER =
            java.time.format.DateTimeFormatter.ofPattern("[H][HH]:mm[:ss]");

    /** Parses "HH:mm" / "H:mm" style strings; null on blank or malformed input. */
    private static LocalTime parseTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalTime.parse(value.trim(), TIME_FORMATTER);
        } catch (java.time.format.DateTimeParseException e) {
            return null;
        }
    }
}
