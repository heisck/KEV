package com.kev.backend.session;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SessionInvigilatorRepository extends JpaRepository<SessionInvigilator, Long> {

    List<SessionInvigilator> findBySessionId(Long sessionId);

    Optional<SessionInvigilator> findBySessionIdAndUserId(Long sessionId, UUID userId);

    boolean existsBySessionIdAndUserId(Long sessionId, UUID userId);

    long countBySessionId(Long sessionId);

    /** Distinct invigilators an admin has assigned across currently ACTIVE sessions. */
    @Query("select count(distinct i.userId) from SessionInvigilator i "
            + "where i.assignedBy = :adminId and i.sessionId in "
            + "(select s.id from ExamSession s where s.status = com.kev.backend.session.SessionStatus.ACTIVE)")
    long countActiveAssignmentsBy(@Param("adminId") UUID adminId);
}
