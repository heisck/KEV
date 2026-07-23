package com.kev.backend.attendance;

import com.kev.backend.attendance.dto.AttendanceDto;
import com.kev.backend.common.ApiException;
import com.kev.backend.directory.DirectoryStudent;
import com.kev.backend.directory.DirectoryStudentRepository;
import com.kev.backend.directory.dto.StudentRecord;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/** Assembles AttendanceDto lists with a single student fetch (no N+1). */
@Component
public class AttendanceMapper {

    private final DirectoryStudentRepository students;

    public AttendanceMapper(DirectoryStudentRepository students) {
        this.students = students;
    }

    public AttendanceDto toDto(AttendanceRecord record) {
        DirectoryStudent student = students.findById(record.getStudentId()).orElse(null);
        StudentRecord sr = student != null
                ? StudentRecord.from(student)
                : new StudentRecord(record.getStudentId(), "Unknown", "Student #" + record.getStudentId(), "Unknown", 100, null, true, com.kev.backend.directory.FeesStatus.PAID, true, List.of());
        return AttendanceDto.from(record, sr);
    }

    public List<AttendanceDto> toDtos(List<AttendanceRecord> records) {
        if (records == null || records.isEmpty()) return List.of();
        List<Long> ids = records.stream().map(r -> r.getStudentId()).filter(id -> id != null).distinct().toList();
        Map<Long, DirectoryStudent> byId =
                students.findAllById(ids).stream().collect(Collectors.toMap(s -> s.getId(), Function.identity(), (left, right) -> left));
        return records.stream()
                .map(r -> {
                    DirectoryStudent student = byId.get(r.getStudentId());
                    StudentRecord sr = student != null
                            ? StudentRecord.from(student)
                            : new StudentRecord(r.getStudentId(), "Unknown", "Student #" + r.getStudentId(), "Unknown", 100, null, true, com.kev.backend.directory.FeesStatus.PAID, true, List.of());
                    return AttendanceDto.from(r, sr);
                })
                .toList();
    }
}
