package com.kev.backend.directory;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DirectoryStudentRepository extends JpaRepository<DirectoryStudent, Long> {

    Optional<DirectoryStudent> findByIndexNumber(String indexNumber);
}
