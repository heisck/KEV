package com.kev.backend.verification.web;

import com.kev.backend.common.ApiException;
import com.kev.backend.directory.UniversityDirectory;
import com.kev.backend.directory.dto.StudentRecord;
import com.kev.backend.ml.MlClient;
import com.kev.backend.verification.dto.FaceVerifyResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/verify")
@Tag(name = "Verification", description = "Face verification fallback via the ML service")
public class FaceVerifyController {

    private final UniversityDirectory directory;
    private final MlClient ml;

    public FaceVerifyController(UniversityDirectory directory, MlClient ml) {
        this.directory = directory;
        this.ml = ml;
    }

    @PostMapping(path = "/face", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FaceVerifyResponse verifyFace(
            @RequestParam("probe") MultipartFile probe, @RequestParam("indexNumber") String indexNumber) {
        StudentRecord student = directory
                .findByIndexNumber(indexNumber)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found: " + indexNumber));
        byte[] probeBytes;
        try {
            probeBytes = probe.getBytes();
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Could not read probe image");
        }
        String filename = probe.getOriginalFilename() != null ? probe.getOriginalFilename() : "probe.jpg";
        MlClient.VerifyFaceResponse result = ml.verifyFace(probeBytes, filename, student.photoUrl());
        return new FaceVerifyResponse(indexNumber, result.similarity(), result.match(), student);
    }
}
