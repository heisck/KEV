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
    @Transactional
    @Cacheable(cacheNames = "directory", key = "#indexNumber", unless = "#result == null")
    public Optional<StudentRecord> findByIndexNumber(String indexNumber) {
        Optional<StudentRecord> existing = students.findByIndexNumberWithCourses(indexNumber).map(StudentRecord::from);
        if (existing.isPresent()) {
            return existing;
        }
        if (indexNumber != null && indexNumber.matches("\\d+")) {
            DirectoryStudent s = new DirectoryStudent();
            s.setIndexNumber(indexNumber);
            s.setFullName("Student " + indexNumber);
            s.setProgramme("Computer Science");
            s.setLevel((short) 300);
            s.setPhotoUrl("https://ui-avatars.com/api/?name=Student+" + indexNumber);
            s.setEnrolled(true);
            s.setFeesStatus(FeesStatus.PAID);
            try {
                return Optional.of(StudentRecord.from(students.save(s)));
            } catch (Exception ex) {
                return students.findByIndexNumberWithCourses(indexNumber).map(StudentRecord::from);
            }
        }
        return Optional.empty();
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
