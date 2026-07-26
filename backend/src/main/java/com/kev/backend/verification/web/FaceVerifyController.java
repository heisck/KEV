package com.kev.backend.verification.web;

import com.kev.backend.common.ApiException;
import com.kev.backend.directory.UniversityDirectory;
import com.kev.backend.directory.dto.StudentRecord;
import com.kev.backend.ml.MlClient;
import com.kev.backend.verification.dto.FaceVerifyResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.util.Base64;
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
            throw new ApiException(HttpStatus.BAD_REQUEST, "Could not read probe image", e);
        }

        String filename = probe.getOriginalFilename() != null ? probe.getOriginalFilename() : "probe.jpg";
        String photoUrl = student.photoUrl();
        MlClient.VerifyFaceResponse result;

        if (photoUrl != null && (photoUrl.startsWith("data:image/") || photoUrl.length() > 200)) {
            String base64Data = photoUrl.contains(",") ? photoUrl.split(",", 2)[1] : photoUrl;
            byte[] refBytes = Base64.getDecoder().decode(base64Data.trim());
            result = ml.verifyFaceDirect(probeBytes, filename, refBytes, "reference.jpg");
        } else if (photoUrl != null && (photoUrl.startsWith("http://") || photoUrl.startsWith("https://"))) {
            result = ml.verifyFace(probeBytes, filename, photoUrl);
        } else {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Student reference photo is unavailable for verification");
        }
        return new FaceVerifyResponse(indexNumber, result.similarity(), result.match(), student);
    }
}
