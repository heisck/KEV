package com.kev.backend.directory.uits;

import com.kev.backend.directory.DirectoryStudent;
import com.kev.backend.directory.DirectoryStudentRepository;
import com.kev.backend.directory.FeesStatus;
import com.kev.backend.ml.MlClient;
import com.kev.backend.verification.FaceEmbeddings;
import com.kev.backend.verification.RosterEmbeddingCache;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Pulls a session's roster from UITS and precomputes each student's face embedding.
 *
 * <p>Runs asynchronously off session creation. Embedding a 400-student roster means 400
 * image fetches over a ~2s-latency link plus 400 model runs — far too slow to block the
 * create request, and unnecessary to: the invigilator has the walk to the hall before
 * the first scan. Scanning degrades gracefully while this is in flight, since matching
 * only considers students that already have an embedding.
 *
 * <p>Work is committed chunk by chunk rather than in one transaction, so an interrupted
 * run leaves the students it already reached usable and the roster screen can show rows
 * arriving in real time.
 */
@Service
public class RosterIngestService {

    /** Progress snapshot for one session's ingest. Every counter is monotonic. */
    public record Status(String state, int progress, int total, int synced, int embedded, String message) {}

    private record Job(String from, String to, String requestedBy) {}

    private static final Logger log = LoggerFactory.getLogger(RosterIngestService.class);
    private static final int MAX_ATTEMPTS = 3;
    /** Share of the bar spent pulling the roster; the remainder tracks embedding. */
    private static final int SYNC_WEIGHT = 30;

    private final UitsClient uits;
    private final MlClient ml;
    private final DirectoryStudentRepository students;
    private final RosterEmbeddingCache rosterCache;
    private final int concurrency;
    private final int batchSize;
    private final ConcurrentMap<Long, Status> statuses = new ConcurrentHashMap<>();

    public RosterIngestService(
            UitsClient uits,
            MlClient ml,
            DirectoryStudentRepository students,
            RosterEmbeddingCache rosterCache,
            @Value("${kev.face.ingest-concurrency}") int concurrency,
            @Value("${kev.face.embed-batch-size}") int batchSize) {
        this.uits = uits;
        this.ml = ml;
        this.students = students;
        this.rosterCache = rosterCache;
        this.concurrency = concurrency;
        this.batchSize = Math.max(1, batchSize);
    }

    /**
     * Sync the given index range from UITS, then embed any student still missing a vector.
     * Failures are logged rather than thrown — this runs detached from a user request, and
     * an unreachable UITS should degrade the session, not break session creation.
     */
    @Async
    public void ingestRangeAsync(Long sessionId, String from, String to, String requestedBy) {
        runIngest(sessionId, new Job(from, to, requestedBy));
    }

    /** Publish a status before the async worker picks the job up. */
    public void prepare(Long sessionId) {
        statuses.put(sessionId, new Status("STARTING", 0, 0, 0, 0, "Starting student information sync"));
    }

    /**
     * Re-run the ingest for a session. The range is supplied by the caller rather than
     * remembered here: this map does not survive a restart, and a roster left half-embedded
     * by one is exactly when a retry has to work.
     */
    @Async
    public void retry(Long sessionId, String from, String to, String requestedBy) {
        update(sessionId, "RETRYING", 0, 0, 0, 0, "Retrying student information sync");
        runIngest(sessionId, new Job(from, to, requestedBy));
    }

    /**
     * Current status, or IDLE when no ingest is registered for the session — a roster that
     * was synced before a restart, or a session whose range never ran. Clients poll only
     * while a job is live, so a terminal state here is what stops them polling forever.
     */
    public Status status(Long sessionId) {
        return statuses.getOrDefault(
                sessionId, new Status("IDLE", 0, 0, 0, 0, "No student information sync is running"));
    }

    /**
     * Publish a status update. Counters merge with {@link Math#max} so the bar only ever
     * advances: a retry resumes from what the previous attempt reached instead of snapping
     * backwards, and a caller can pass 0 for the fields it does not want to change.
     */
    private void update(
            Long sessionId, String state, int progress, int total, int synced, int embedded, String message) {
        statuses.merge(
                sessionId,
                new Status(state, progress, total, synced, embedded, message),
                (existing, next) -> new Status(
                        next.state(),
                        Math.max(existing.progress(), next.progress()),
                        Math.max(existing.total(), next.total()),
                        Math.max(existing.synced(), next.synced()),
                        Math.max(existing.embedded(), next.embedded()),
                        next.message()));
    }

    private void runIngest(Long sessionId, Job job) {
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                update(sessionId, "RUNNING", 5, 0, 0, 0, "Contacting the university student system");
                int synced = syncRange(job.from(), job.to(), job.requestedBy());
                update(sessionId, "RUNNING", SYNC_WEIGHT, synced, synced, 0, "Preparing face verification");
                int embedded = embedPending(sessionId, job.from(), job.to(), synced);
                update(sessionId, "COMPLETED", 100, synced, synced, embedded, "Student information ready");
                log.info(
                        "roster ingest complete: range=[{}..{}] synced={} embedded={}",
                        job.from(),
                        job.to(),
                        synced,
                        embedded);
                return;
            } catch (RuntimeException error) {
                boolean last = attempt == MAX_ATTEMPTS;
                update(sessionId, last ? "FAILED" : "RETRYING", 0, 0, 0, 0, error.getMessage());
                log.warn("roster ingest attempt {} failed for session {}", attempt, sessionId, error);
            }
        }
    }

    /** Upsert UITS roster rows into the local directory. Returns the number synced. */
    public int syncRange(String from, String to, String requestedBy) {
        List<UitsClient.UitsStudent> roster = uits.fetchRoster(from, to, requestedBy);
        for (int start = 0; start < roster.size(); start += batchSize) {
            List<UitsClient.UitsStudent> chunk = roster.subList(start, Math.min(start + batchSize, roster.size()));
            List<DirectoryStudent> merged = new ArrayList<>(chunk.size());
            for (UitsClient.UitsStudent incoming : chunk) {
                DirectoryStudent student = students.findByUitsId(incoming.id())
                        .or(() -> students.findByIndexNumber(incoming.indexNumber()))
                        .orElseGet(DirectoryStudent::new);
                applyIncoming(student, incoming);
                merged.add(student);
            }
            students.saveAll(merged);
        }
        return roster.size();
    }

    /**
     * Embed every synced student that has no vector yet, one chunk per ML call.
     *
     * <p>Chunking is what keeps each request inside the ML read timeout: a single
     * 500-photo call runs for minutes and surfaces to the user as "face embedding service
     * unavailable" even though the service is healthy. It also lets both the progress bar
     * and the roster screen update while the batch is still running.
     */
    public int embedPending(Long sessionId, String from, String to, int total) {
        List<DirectoryStudent> pending = students.findPendingEmbeddingInIndexRange(from, to);
        int embedded = 0;
        for (int start = 0; start < pending.size(); start += batchSize) {
            List<DirectoryStudent> chunk = pending.subList(start, Math.min(start + batchSize, pending.size()));
            embedded += embedChunk(chunk);
            // Publish each chunk to the scan path immediately: students should become
            // scannable as they land, not only once the whole roster finishes.
            rosterCache.invalidate(from, to);
            int done = start + chunk.size();
            update(
                    sessionId,
                    "RUNNING",
                    SYNC_WEIGHT + (100 - SYNC_WEIGHT) * done / pending.size(),
                    total,
                    total,
                    embedded,
                    "Preparing face verification for " + done + " of " + pending.size() + " students");
        }
        if (embedded < pending.size()) {
            log.warn("{} of {} roster photos produced no usable face", pending.size() - embedded, pending.size());
        }
        return embedded;
    }

    /** Embed one chunk and persist it immediately. Returns how many vectors were stored. */
    private int embedChunk(List<DirectoryStudent> chunk) {
        List<String> urls = chunk.stream().map(DirectoryStudent::getPhotoUrl).toList();

        // Match results back by URL: the batch preserves order, but keying by URL keeps
        // this correct even if the service ever reorders or drops entries.
        Map<String, MlClient.EmbedItem> byUrl = new HashMap<>();
        for (MlClient.EmbedItem item : ml.embedFaces(urls, concurrency)) {
            byUrl.put(item.url(), item);
        }

        List<DirectoryStudent> updated = new ArrayList<>(chunk.size());
        for (DirectoryStudent student : chunk) {
            MlClient.EmbedItem item = byUrl.get(student.getPhotoUrl());
            if (item == null || item.embedding() == null) {
                log.warn(
                        "no embedding for student index={} reason={}",
                        student.getIndexNumber(),
                        item != null ? item.error() : "missing from batch response");
                continue;
            }
            student.setFaceEmbedding(FaceEmbeddings.toBytes(item.embedding()));
            student.setFaceDetScore(item.detScore() != null ? item.detScore().floatValue() : null);
            student.setFaceModelVersion(item.modelVersion());
            student.setFaceEmbeddedAt(Instant.now());
            updated.add(student);
        }
        students.saveAll(updated);
        return updated.size();
    }

    private void applyIncoming(DirectoryStudent student, UitsClient.UitsStudent incoming) {
        String photoUrl = incoming.bestPhotoUrl();
        // Re-embed only when the photo actually changed; embeddings are expensive and
        // a name or NFC edit says nothing about the face.
        if (photoUrl != null && !photoUrl.equals(student.getPhotoUrl())) {
            student.setFaceEmbedding(null);
            student.setFaceEmbeddedAt(null);
        }
        student.setUitsId(incoming.id());
        student.setIndexNumber(incoming.indexNumber());
        student.setFullName(incoming.fullName());
        student.setNfcCode(incoming.nfcCode());
        student.setPhotoUrl(photoUrl);
        // UITS carries identity, not eligibility; these stay at their defaults until a
        // fees/enrolment feed exists rather than being invented here.
        if (student.getProgramme() == null) {
            student.setProgramme("");
        }
        if (student.getFeesStatus() == null) {
            student.setFeesStatus(FeesStatus.PAID);
        }
    }
}
