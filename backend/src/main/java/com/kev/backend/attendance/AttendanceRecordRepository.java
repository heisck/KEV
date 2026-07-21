package com.kev.backend.attendance;

import com.kev.backend.session.SessionCount;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findBySessionIdOrderByCheckedInAtDesc(Long sessionId);

    Optional<AttendanceRecord> findBySessionIdAndStudentId(Long sessionId, Long studentId);

    long countBySessionIdAndStatus(Long sessionId, AttendanceStatus status);

    @Query("select new com.kev.backend.session.SessionCount(a.sessionId, count(a)) "
            + "from AttendanceRecord a where a.sessionId in :sessionIds "
            + "and a.status = com.kev.backend.attendance.AttendanceStatus.CHECKED_IN group by a.sessionId")
    List<SessionCount> countCheckedInBySessionIds(@Param("sessionIds") List<Long> sessionIds);
}
