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
        DirectoryStudent student = students.findById(record.getStudentId())
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Student row missing"));
        return AttendanceDto.from(record, StudentRecord.from(student));
    }

    public List<AttendanceDto> toDtos(List<AttendanceRecord> records) {
        List<Long> ids = records.stream().map(r -> r.getStudentId()).toList();
        Map<Long, DirectoryStudent> byId =
                students.findAllById(ids).stream().collect(Collectors.toMap(s -> s.getId(), Function.identity()));
        return records.stream()
                .map(r -> AttendanceDto.from(r, StudentRecord.from(byId.get(r.getStudentId()))))
                .toList();
    }
}
