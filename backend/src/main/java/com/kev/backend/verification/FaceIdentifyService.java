package com.kev.backend.verification;

import com.kev.backend.common.ApiException;
import com.kev.backend.directory.DirectoryStudent;
import com.kev.backend.directory.DirectoryStudentRepository;
import com.kev.backend.directory.dto.StudentRecord;
import com.kev.backend.ml.MlClient;
import com.kev.backend.session.ExamSession;
import com.kev.backend.verification.dto.FaceIdentifyResponse;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 1:N face identification against a session roster.
 *
 * <p>The whole scan path is one model call — embedding the probe — followed by a linear
 * scan of precomputed reference vectors. Reference photos are never fetched or embedded
 * here; that happens once at ingest ({@code RosterIngestService}).
 */
@Service
public class FaceIdentifyService {

    private static final Logger log = LoggerFactory.getLogger(FaceIdentifyService.class);

    private final DirectoryStudentRepository students;
    private final MlClient ml;
    private final double matchThreshold;
    private final double marginThreshold;
    private final double minDetScore;

    public FaceIdentifyService(
            DirectoryStudentRepository students,
            MlClient ml,
            @Value("${kev.face.match-threshold}") double matchThreshold,
            @Value("${kev.face.margin-threshold}") double marginThreshold,
            @Value("${kev.face.min-det-score}") double minDetScore) {
        this.students = students;
        this.ml = ml;
        this.matchThreshold = matchThreshold;
        this.marginThreshold = marginThreshold;
        this.minDetScore = minDetScore;
    }

    @Transactional(readOnly = true)
    public FaceIdentifyResponse identify(ExamSession session, byte[] probeImage, String filename) {
        MlClient.EmbedFaceResponse probe = ml.embedFace(probeImage, filename);
        if (probe == null || probe.embedding() == null) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "No face detected. Hold steady and retry.");
        }
        // Reject a poor capture before matching — scoring a blurred face against the whole
        // roster invites a confident wrong answer rather than an honest retry.
        if (probe.detScore() < minDetScore) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_CONTENT, "Face not clear enough. Move closer and hold steady.");
        }

        List<DirectoryStudent> roster =
                students.findEmbeddedInIndexRange(session.getIndexRangeStart(), session.getIndexRangeEnd());
        if (roster.isEmpty()) {
            throw new ApiException(
                    HttpStatus.CONFLICT, "This session's roster is still syncing. Try again in a moment.");
        }

        float[] probeVector = FaceEmbeddings.toVector(probe.embedding());
        DirectoryStudent best = null;
        double bestScore = Double.NEGATIVE_INFINITY;
        double runnerUp = Double.NEGATIVE_INFINITY;

        for (DirectoryStudent candidate : roster) {
            double score = FaceEmbeddings.cosine(probeVector, FaceEmbeddings.toVector(candidate.getFaceEmbedding()));
            if (score > bestScore) {
                runnerUp = bestScore;
                bestScore = score;
                best = candidate;
            } else if (score > runnerUp) {
                runnerUp = score;
            }
        }

        double margin = runnerUp == Double.NEGATIVE_INFINITY ? bestScore : bestScore - runnerUp;
        boolean confident = bestScore >= matchThreshold && margin >= marginThreshold;

        if (!confident) {
            // Distinguish "nobody here" from "two people score alike" — the second is the
            // dangerous one in 1:N, and it should send the invigilator to manual entry
            // rather than silently checking in whoever happened to score highest.
            String detail = bestScore < matchThreshold
                    ? "No match in this session's roster."
                    : "Two students scored too closely to be sure. Use manual entry.";
            log.info(
                    "face identify rejected: session={} top={} margin={} roster={}",
                    session.getId(),
                    String.format("%.3f", bestScore),
                    String.format("%.3f", margin),
                    roster.size());
            return FaceIdentifyResponse.noMatch(bestScore, margin, roster.size(), detail);
        }

        log.info(
                "face identify matched: session={} index={} score={} margin={} roster={}",
                session.getId(),
                best.getIndexNumber(),
                String.format("%.3f", bestScore),
                String.format("%.3f", margin),
                roster.size());
        return FaceIdentifyResponse.matched(StudentRecord.from(best), bestScore, margin, roster.size());
    }
}
