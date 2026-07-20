package com.kev.backend.directory;

import com.kev.backend.directory.dto.StudentRecord;
import java.util.List;
import java.util.Optional;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** UITS directory backed by the {@code directory_students} table in Postgres. */
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
        return students.findByIndexNumberWithCourses(indexNumber).map(StudentRecord::from);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentRecord> findAll() {
        return students.findAllWithCourses().stream().map(StudentRecord::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentRecord> search(String query) {
        return students.searchWithCourses(query).stream()
                .map(StudentRecord::from)
                .toList();
    }
}
