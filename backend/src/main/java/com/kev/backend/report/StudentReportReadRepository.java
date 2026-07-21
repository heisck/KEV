package com.kev.backend.report;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentReportReadRepository extends JpaRepository<StudentReportRead, Long> {

    boolean existsByReportIdAndUserId(Long reportId, UUID userId);

    @Query("select receipt.reportId from StudentReportRead receipt "
            + "where receipt.userId = :userId and receipt.reportId in :reportIds")
    List<Long> findReadReportIds(@Param("userId") UUID userId, @Param("reportIds") List<Long> reportIds);
}
