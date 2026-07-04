package com.kev.backend.session;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExamSessionRepository extends JpaRepository<ExamSession, Long> {

    Optional<ExamSession> findBySessionCode(String sessionCode);

    boolean existsBySessionCode(String sessionCode);

    @Query("select s from ExamSession s where s.id in "
            + "(select i.sessionId from SessionInvigilator i where i.userId = :userId) "
            + "order by s.startedAt desc")
    List<ExamSession> findAllForUser(@Param("userId") UUID userId);
}
