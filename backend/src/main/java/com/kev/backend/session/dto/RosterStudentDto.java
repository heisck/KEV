package com.kev.backend.session.dto;

import com.kev.backend.directory.DirectoryStudent;

/**
 * One student on a session's roster.
 *
 * <p>{@code faceReady} is what the roster screen uses to show a student as still being
 * prepared: the row exists as soon as UITS returns it, but face scanning can only match
 * it once the embedding has been computed.
 */
public record RosterStudentDto(
        String indexNumber, String fullName, String photoUrl, String nfcCode, boolean faceReady) {

    public static RosterStudentDto from(DirectoryStudent student) {
        return new RosterStudentDto(
                student.getIndexNumber(),
                student.getFullName(),
                student.getPhotoUrl(),
                student.getNfcCode(),
                student.getFaceEmbedding() != null);
    }
}
