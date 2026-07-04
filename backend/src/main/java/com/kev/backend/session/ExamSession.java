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
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

/** An exam room session created via Room Setup; joinable by session code. */
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
