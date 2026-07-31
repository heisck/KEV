package com.kev.backend.verification.dto;

import com.kev.backend.directory.dto.StudentRecord;

/**
 * Outcome of a 1:N face identification.
 *
 * <p>{@code similarity} and {@code margin} are always populated so the invigilator (and
 * later tuning) can see how close the call was, even when it is rejected. {@code margin}
 * is the gap to the runner-up: a high similarity with a low margin means two students
 * look alike to the model, which is a different failure from nobody matching.
 */
public record FaceIdentifyResponse(
        boolean match, StudentRecord student, double similarity, double margin, int rosterSize, String detail) {

    public static FaceIdentifyResponse matched(
            StudentRecord student, double similarity, double margin, int rosterSize) {
        return new FaceIdentifyResponse(true, student, similarity, margin, rosterSize, null);
    }

    public static FaceIdentifyResponse noMatch(double similarity, double margin, int rosterSize, String detail) {
        return new FaceIdentifyResponse(false, null, similarity, margin, rosterSize, detail);
    }
}
