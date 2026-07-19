package com.kev.backend.directory;

import com.kev.backend.directory.dto.StudentRecord;
import java.util.List;
import java.util.Optional;

/**
 * Lookup boundary to the university student database (UITS).
 */
public interface UniversityDirectory {

    Optional<StudentRecord> findByIndexNumber(String indexNumber);

    List<StudentRecord> findAll();

    List<StudentRecord> search(String query);
}
