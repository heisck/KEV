package com.kev.backend.report;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StudentReportRepository extends JpaRepository<StudentReport, Long> {

    @Query(
            """
            select distinct report from StudentReport report
            left join fetch report.session
            left join fetch report.student student
            left join fetch student.courses
            join fetch report.author
            order by report.createdAt desc
            """)
    List<StudentReport> findAllVisible();
}
