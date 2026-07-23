package com.kev.backend.session;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamSessionRepository extends JpaRepository<ExamSession, Long> {

    Optional<ExamSession> findBySessionCode(String sessionCode);

    Optional<ExamSession> findBySessionPassword(String sessionPassword);

    Optional<ExamSession> findBySessionCodeOrSessionPassword(String sessionCode, String sessionPassword);

    boolean existsBySessionCode(String sessionCode);

    java.util.List<ExamSession> findAllByOrderByStartedAtDesc();
}
