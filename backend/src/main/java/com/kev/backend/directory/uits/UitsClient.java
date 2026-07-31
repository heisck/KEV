package com.kev.backend.directory.uits;

import com.kev.backend.common.ApiException;
import com.kev.backend.web.CorrelationIdFilter;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

/**
 * HTTP client for the external UITS student system.
 *
 * <p>UITS returns image <em>URLs</em>, never image bytes — {@code faceUrl} is a
 * downscaled, JPEG-normalized derivative sized for face recognition. Fetching those
 * images is the ingest pipeline's job, not this client's.
 */
@Component
public class UitsClient {

    /** One roster row as returned by {@code POST /api/sync/request}. */
    public record UitsStudent(
            String id,
            String firstName,
            String lastName,
            String indexNumber,
            String studentId,
            String nfcCode,
            String imageUrl,
            String faceUrl) {

        public String fullName() {
            return (safe(firstName) + " " + safe(lastName)).trim();
        }

        /** Prefer the optimized derivative; fall back to the original if UITS omitted it. */
        public String bestPhotoUrl() {
            return faceUrl != null && !faceUrl.isBlank() ? faceUrl : imageUrl;
        }

        private static String safe(String value) {
            return value != null ? value.trim() : "";
        }
    }

    private record SyncResponse(boolean success, String sessionId, int count, List<UitsStudent> data) {}

    private final RestClient client;

    public UitsClient(@Value("${kev.uits.base-url}") String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        // The UITS link is high-latency; a roster pull is metadata-only but still slow.
        factory.setReadTimeout(Duration.ofSeconds(45));
        this.client = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .requestInitializer(request -> {
                    String correlationId = MDC.get(CorrelationIdFilter.MDC_KEY);
                    if (correlationId != null) {
                        request.getHeaders().set(CorrelationIdFilter.HEADER, correlationId);
                    }
                })
                .build();
    }

    /** Fetch every student whose index number falls in {@code [from, to]}. */
    public List<UitsStudent> fetchRoster(String from, String to, String requestedBy) {
        Map<String, Object> body =
                Map.of("indexFrom", from, "indexTo", to, "requestedBy", requestedBy, "deviceInfo", "kev-backend");
        try {
            SyncResponse response = client.post()
                    .uri("/api/sync/request")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<SyncResponse>() {});
            if (response == null || response.data() == null) {
                return List.of();
            }
            return response.data();
        } catch (ResourceAccessException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "University student system is unreachable");
        }
    }
}
