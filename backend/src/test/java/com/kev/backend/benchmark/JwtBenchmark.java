package com.kev.backend.benchmark;

import com.kev.backend.auth.JwtService;
import com.kev.backend.auth.User;
import com.kev.backend.support.JwtTestSupport;
import java.util.concurrent.TimeUnit;
import org.openjdk.jmh.annotations.Benchmark;
import org.openjdk.jmh.annotations.BenchmarkMode;
import org.openjdk.jmh.annotations.Mode;
import org.openjdk.jmh.annotations.OutputTimeUnit;
import org.openjdk.jmh.annotations.Scope;
import org.openjdk.jmh.annotations.Setup;
import org.openjdk.jmh.annotations.State;

/**
 * JMH micro-benchmark for access-token issuance throughput.
 * Run with: mvn -Pjmh test-compile exec:java
 * (Not executed by Surefire — it has no @Test methods.)
 */
@State(Scope.Thread)
@BenchmarkMode(Mode.Throughput)
@OutputTimeUnit(TimeUnit.MILLISECONDS)
public class JwtBenchmark {

    private JwtService jwtService;
    private User user;

    @Setup
    public void setUp() {
        jwtService = new JwtService(JwtTestSupport.encoder(), JwtTestSupport.props());
        user = JwtTestSupport.user("bench@example.com");
    }

    @Benchmark
    public String issueAccessToken() {
        return jwtService.issueAccessToken(user);
    }
}
