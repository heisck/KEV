package com.kev.backend.verification.dto;

import com.kev.backend.directory.dto.StudentRecord;

public record FaceVerifyResponse(String indexNumber, double similarity, boolean match, StudentRecord student) {}
