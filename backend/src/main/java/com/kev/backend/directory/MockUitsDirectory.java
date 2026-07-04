package com.kev.backend.directory;

import com.kev.backend.directory.dto.StudentRecord;
import java.util.Optional;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Simulated UITS directory backed by the seeded {@code directory_students} table. */
@Service
@ConditionalOnProperty(name = "kev.directory.provider", havingValue = "mock", matchIfMissing = true)
public class MockUitsDirectory implements UniversityDirectory {

    private final DirectoryStudentRepository students;

    public MockUitsDirectory(DirectoryStudentRepository students) {
        this.students = students;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "directory", key = "#indexNumber")
    public Optional<StudentRecord> findByIndexNumber(String indexNumber) {
        return students.findByIndexNumber(indexNumber).map(StudentRecord::from);
    }
}
