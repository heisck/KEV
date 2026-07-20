package com.kev.backend.session;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

/** An exam room session created via Room Setup; joinable by session code or password. */
@Entity
@Table(name = "exam_sessions")
@Getter
@Setter
public class ExamSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_code", nullable = false, unique = true)
    private String sessionCode;

    @Column(name = "session_password")
    private String sessionPassword;

    @Column(name = "title")
    private String title;

    /** Comma-separated course codes, e.g. "DCIT 301,DCIT 305". */
    @Column(name = "course_codes", nullable = false)
    private String courseCodes;

    @Column(nullable = false)
    private String building;

    @Column
    private String floor;

    @Column
    private String room;

    @Column(name = "index_range_start")
    private String indexRangeStart;

    @Column(name = "index_range_end")
    private String indexRangeEnd;

    @Column(name = "exam_date")
    private LocalDate examDate;

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "end_time")
    private String endTime;

    @Column(name = "verification_methods")
    private String verificationMethods = "FACE,NFC,MANUAL";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.ACTIVE;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "started_at", nullable = false, updatable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "ended_at")
    private Instant endedAt;
}
