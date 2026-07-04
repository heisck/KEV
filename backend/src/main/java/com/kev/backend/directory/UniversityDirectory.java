package com.kev.backend.directory;

import com.kev.backend.directory.dto.StudentRecord;
import java.util.Optional;

/**
 * Lookup boundary to the university student database (UITS). The mock
 * implementation reads seeded rows; a real integration replaces it without
 * touching callers.
 */
public interface UniversityDirectory {

    Optional<StudentRecord> findByIndexNumber(String indexNumber);
}
