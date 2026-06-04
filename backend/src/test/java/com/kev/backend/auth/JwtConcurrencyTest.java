package com.kev.backend.auth;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;

import com.kev.backend.support.JwtTestSupport;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

/** Hammers the JWT encoder/decoder from many threads to catch thread-safety regressions. */
class JwtConcurrencyTest {

    @Test
    void issuesAndVerifiesConcurrentlyWithoutError() throws InterruptedException {
        JwtService jwtService = new JwtService(JwtTestSupport.encoder(), JwtTestSupport.props());
        JwtDecoder decoder = JwtTestSupport.decoder();

        int threads = 32;
        int perThread = 50;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger verified = new AtomicInteger();
        AtomicReference<Throwable> failure = new AtomicReference<>();

        for (int t = 0; t < threads; t++) {
            pool.execute(() -> {
                ready.countDown();
                try {
                    start.await();
                    for (int i = 0; i < perThread; i++) {
                        User user = JwtTestSupport.user("user@example.com");
                        Jwt decoded = decoder.decode(jwtService.issueAccessToken(user));
                        if (user.getId().toString().equals(decoded.getSubject())) {
                            verified.incrementAndGet();
                        }
                    }
                } catch (Throwable e) {
                    failure.compareAndSet(null, e);
                }
            });
        }

        ready.await();
        start.countDown();
        pool.shutdown();

        assertThat(pool.awaitTermination(30, SECONDS)).isTrue();
        assertThat(failure.get()).isNull();
        assertThat(verified.get()).isEqualTo(threads * perThread);
    }
}
