package com.kev.backend.session;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class SessionStatusCalculatorTest {

    private ExamSession session(String date, String start, String end, SessionStatus stored) {
        ExamSession s = new ExamSession();
        s.setExamDate(date == null ? null : LocalDate.parse(date));
        s.setStartTime(start);
        s.setEndTime(end);
        s.setStatus(stored);
        return s;
    }

    private LocalDateTime at(String iso) {
        return LocalDateTime.parse(iso);
    }

    @Test
    void beforeStartIsUpcoming() {
        ExamSession s = session("2026-08-01", "09:00", "12:00", SessionStatus.ACTIVE);
        assertThat(SessionStatusCalculator.resolve(s, at("2026-08-01T08:00"))).isEqualTo(SessionStatus.UPCOMING);
    }

    @Test
    void withinWindowIsOngoing() {
        ExamSession s = session("2026-08-01", "09:00", "12:00", SessionStatus.ACTIVE);
        assertThat(SessionStatusCalculator.resolve(s, at("2026-08-01T10:30"))).isEqualTo(SessionStatus.ONGOING);
    }

    @Test
    void afterEndIsCompleted() {
        ExamSession s = session("2026-08-01", "09:00", "12:00", SessionStatus.ACTIVE);
        assertThat(SessionStatusCalculator.resolve(s, at("2026-08-01T13:00"))).isEqualTo(SessionStatus.COMPLETED);
    }

    @Test
    void noDateIsUpcoming() {
        ExamSession s = session(null, null, null, SessionStatus.ACTIVE);
        assertThat(SessionStatusCalculator.resolve(s, at("2026-08-01T10:00"))).isEqualTo(SessionStatus.UPCOMING);
    }

    @Test
    void cancelledOverridesSchedule() {
        ExamSession s = session("2026-08-01", "09:00", "12:00", SessionStatus.CANCELLED);
        assertThat(SessionStatusCalculator.resolve(s, at("2026-08-01T10:30"))).isEqualTo(SessionStatus.CANCELLED);
    }

    @Test
    void endedMapsToCompletedEvenWithinWindow() {
        ExamSession s = session("2026-08-01", "09:00", "12:00", SessionStatus.ENDED);
        assertThat(SessionStatusCalculator.resolve(s, at("2026-08-01T10:30"))).isEqualTo(SessionStatus.COMPLETED);
    }

    @Test
    void malformedTimeFallsBackToDayBounds() {
        ExamSession s = session("2026-08-01", "not-a-time", null, SessionStatus.ACTIVE);
        // start unparseable → LocalTime.MIN, end null → LocalTime.MAX: whole day is ONGOING.
        assertThat(SessionStatusCalculator.resolve(s, at("2026-08-01T10:00"))).isEqualTo(SessionStatus.ONGOING);
    }
}
