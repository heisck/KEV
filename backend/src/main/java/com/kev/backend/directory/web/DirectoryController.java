package com.kev.backend.directory.web;

import com.kev.backend.common.ApiException;
import com.kev.backend.directory.UniversityDirectory;
import com.kev.backend.directory.dto.StudentRecord;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/directory")
@Tag(name = "Directory", description = "University directory (UITS) lookups")
public class DirectoryController {

    private final UniversityDirectory directory;

    public DirectoryController(UniversityDirectory directory) {
        this.directory = directory;
    }

    @GetMapping("/students/{indexNumber}")
    public StudentRecord lookup(@PathVariable String indexNumber) {
        return directory
                .findByIndexNumber(indexNumber)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found: " + indexNumber));
    }
}
