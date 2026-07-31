package com.kev.backend.verification.web;

import com.kev.backend.common.ApiException;
import com.kev.backend.directory.UniversityDirectory;
import com.kev.backend.directory.dto.StudentRecord;
import com.kev.backend.ml.MlClient;
import com.kev.backend.session.ExamSession;
import com.kev.backend.session.SessionService;
import com.kev.backend.verification.FaceIdentifyService;
import com.kev.backend.verification.dto.FaceIdentifyResponse;
import com.kev.backend.verification.dto.FaceVerifyResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
    private final FaceIdentifyService identifyService;
    private final SessionService sessions;

    public FaceVerifyController(
            UniversityDirectory directory, MlClient ml, FaceIdentifyService identifyService, SessionService sessions) {
        this.directory = directory;
        this.ml = ml;
        this.identifyService = identifyService;
        this.sessions = sessions;
    }

    /**
     * 1:N identification — capture a face, get back who it is.
     *
     * <p>The scan path for a full exam hall: the invigilator does not type an index
     * number, so this searches the session roster directly. Cost is one model call plus
     * a vector scan, independent of roster size.
     */
    @PostMapping(path = "/face/identify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FaceIdentifyResponse identifyFace(
            @AuthenticationPrincipal Jwt principal,
            @RequestParam("probe") MultipartFile probe,
            @RequestParam("sessionId") Long sessionId) {
        UUID userId = UUID.fromString(principal.getSubject());
        ExamSession session = sessions.requireOngoingMember(userId, sessionId);
        byte[] probeBytes = readProbe(probe);
        String filename = probe.getOriginalFilename() != null ? probe.getOriginalFilename() : "probe.jpg";
        return identifyService.identify(session, probeBytes, filename);
    }

    private byte[] readProbe(MultipartFile probe) {
        if (probe.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Probe image is empty");
        }
        try {
            return probe.getBytes();
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Could not read probe image");
        }
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
