package com.kev.backend.directory;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DirectoryStudentRepository extends JpaRepository<DirectoryStudent, Long> {

    Optional<DirectoryStudent> findByIndexNumber(String indexNumber);

    @Query(
            "SELECT s FROM DirectoryStudent s WHERE LOWER(REPLACE(REPLACE(REPLACE(s.nfcCode, ':', ''), '-', ''), ' ', '')) = :nfcCode")
    Optional<DirectoryStudent> findByNormalizedNfcCode(@Param("nfcCode") String nfcCode);

    Optional<DirectoryStudent> findByUitsId(String uitsId);

    /**
     * Roster candidates for 1:N matching: students in the session's index range that
     * already have a precomputed embedding. Index numbers are fixed-width numeric
     * strings, so a lexicographic BETWEEN is equivalent to a numeric range and lets
     * the index do the work. Rows still awaiting embedding are skipped rather than
     * silently treated as non-matches.
     */
    @Query(
            """
            SELECT s FROM DirectoryStudent s
             WHERE s.faceEmbedding IS NOT NULL
               AND (:from IS NULL OR s.indexNumber >= :from)
               AND (:to IS NULL OR s.indexNumber <= :to)
            """)
    List<DirectoryStudent> findEmbeddedInIndexRange(@Param("from") String from, @Param("to") String to);

    /**
     * Every synced student in the session's index range, embedded or not — what the
     * roster screen lists. Unlike {@link #findEmbeddedInIndexRange} this keeps rows that
     * are still awaiting a face vector, so the roster fills in visibly during ingest.
     */
    @Query(
            """
            SELECT s FROM DirectoryStudent s
             WHERE (:from IS NULL OR s.indexNumber >= :from)
               AND (:to IS NULL OR s.indexNumber <= :to)
             ORDER BY s.indexNumber
            """)
    List<DirectoryStudent> findInIndexRange(@Param("from") String from, @Param("to") String to);

    /** How many students the session expects — the roster total shown on its detail screen. */
    @Query(
            """
            SELECT COUNT(s) FROM DirectoryStudent s
             WHERE (:from IS NULL OR s.indexNumber >= :from)
               AND (:to IS NULL OR s.indexNumber <= :to)
            """)
    long countInIndexRange(@Param("from") String from, @Param("to") String to);

    /**
     * One session's backfill queue: students in its index range that are synced but have no
     * face vector yet. Scoped to the range because an unscoped queue makes a session wait on
     * — and report progress against — every unembedded student in the directory.
     */
    @Query(
            """
            SELECT s FROM DirectoryStudent s
             WHERE s.faceEmbedding IS NULL AND s.photoUrl IS NOT NULL
               AND (:from IS NULL OR s.indexNumber >= :from)
               AND (:to IS NULL OR s.indexNumber <= :to)
             ORDER BY s.indexNumber
            """)
    List<DirectoryStudent> findPendingEmbeddingInIndexRange(@Param("from") String from, @Param("to") String to);

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
