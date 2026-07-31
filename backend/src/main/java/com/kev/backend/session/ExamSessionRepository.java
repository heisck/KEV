package com.kev.backend.session;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamSessionRepository extends JpaRepository<ExamSession, Long> {

    /**
     * Every session, newest first. Derived from the method name rather than a
     * {@code Sort.by("startedAt")} string so the property is checked against the entity
     * at startup instead of failing at query time if the field is ever renamed.
     */
    List<ExamSession> findAllByOrderByStartedAtDesc();

    Optional<ExamSession> findBySessionCode(String sessionCode);

    Optional<ExamSession> findBySessionPassword(String sessionPassword);

    Optional<ExamSession> findBySessionCodeOrSessionPassword(String sessionCode, String sessionPassword);

    boolean existsBySessionCode(String sessionCode);
}
