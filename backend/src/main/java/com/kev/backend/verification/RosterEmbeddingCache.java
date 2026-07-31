package com.kev.backend.verification;

import com.kev.backend.directory.DirectoryStudentRepository;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * In-process cache of a roster's reference vectors, keyed by index range.
 *
 * <p>Scoring 500 candidates takes ~0.4 ms; fetching them does not. Each scan otherwise
 * re-read every row from Neon — 500 x 512 float32 is ~1 MB per scan, over a link to
 * another continent — so the roster fetch, not the matching, was what a hall full of
 * students would have waited on.
 *
 * <p>Deliberately local rather than in Redis: Upstash is also a network hop, so caching
 * a megabyte there would only move the transfer, not remove it. Vectors are decoded to
 * {@code float[]} once here instead of per scan.
 *
 * <p>Entries are invalidated when ingest writes new embeddings for the range, with a TTL
 * as a backstop so a missed invalidation self-heals rather than serving a stale roster
 * for the rest of the process's life.
 */
@Component
public class RosterEmbeddingCache {

    /** One roster row reduced to what matching actually needs. */
    public record Candidate(String indexNumber, float[] embedding) {}

    private record Key(String from, String to) {}

    private record Entry(List<Candidate> candidates, long loadedAt) {}

    private static final Logger log = LoggerFactory.getLogger(RosterEmbeddingCache.class);
    private static final long TTL_NANOS = Duration.ofMinutes(10).toNanos();
    /** Enough for every hall running at once; bounds memory if ranges churn. */
    private static final int MAX_RANGES = 32;

    private final DirectoryStudentRepository students;
    private final ConcurrentMap<Key, Entry> cache = new ConcurrentHashMap<>();

    public RosterEmbeddingCache(DirectoryStudentRepository students) {
        this.students = students;
    }

    /** The range's embedded students, loading and caching them on a miss. */
    @Transactional(readOnly = true)
    public List<Candidate> candidates(String from, String to) {
        Key key = new Key(from, to);
        Entry cached = cache.get(key);
        if (cached != null && System.nanoTime() - cached.loadedAt() < TTL_NANOS) {
            return cached.candidates();
        }
        List<Candidate> loaded = students.findEmbeddedInIndexRange(from, to).stream()
                .map(student ->
                        new Candidate(student.getIndexNumber(), FaceEmbeddings.toVector(student.getFaceEmbedding())))
                .toList();
        if (cache.size() >= MAX_RANGES) {
            cache.clear();
        }
        cache.put(key, new Entry(loaded, System.nanoTime()));
        log.debug("roster embeddings cached: range=[{}..{}] candidates={}", from, to, loaded.size());
        return loaded;
    }

    /** Drop a range after ingest stores new vectors for it, so the next scan sees them. */
    public void invalidate(String from, String to) {
        cache.remove(new Key(from, to));
    }
}
