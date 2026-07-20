package com.kev.backend.directory;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DirectoryStudentRepository extends JpaRepository<DirectoryStudent, Long> {

    Optional<DirectoryStudent> findByIndexNumber(String indexNumber);

    @Query(
            "SELECT s FROM DirectoryStudent s WHERE LOWER(s.indexNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<DirectoryStudent> search(@Param("query") String query);

    // Fetch-join courses to avoid an N+1 select-per-student when mapping the whole directory.
    @Query("SELECT DISTINCT s FROM DirectoryStudent s LEFT JOIN FETCH s.courses")
    List<DirectoryStudent> findAllWithCourses();

    @Query("SELECT s FROM DirectoryStudent s LEFT JOIN FETCH s.courses WHERE s.indexNumber = :indexNumber")
    Optional<DirectoryStudent> findByIndexNumberWithCourses(@Param("indexNumber") String indexNumber);

    @Query(
            "SELECT DISTINCT s FROM DirectoryStudent s LEFT JOIN FETCH s.courses WHERE LOWER(s.indexNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<DirectoryStudent> searchWithCourses(@Param("query") String query);
}
