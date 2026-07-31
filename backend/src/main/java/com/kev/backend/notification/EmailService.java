package com.kev.backend.notification;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.concurrent.CompletableFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Transactional email through the Gmail REST API over HTTPS.
 *
 * <p>Deliberately not SMTP: Render blocks outbound 25/465/587 on free web services, and Railway
 * blocks them below the Pro plan, so a JavaMailSender would simply time out once deployed. Port 443
 * cannot be blocked without breaking the app's own HTTP serving, so this transport always survives.
 *
 * <p>With no refresh token configured it logs and returns, keeping tests and offline dev silent.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final URI TOKEN_URI = URI.create("https://oauth2.googleapis.com/token");
    private static final URI SEND_URI = URI.create("https://gmail.googleapis.com/gmail/v1/users/me/messages/send");
    /** Refresh slightly early so a send already in flight never races the expiry. */
    private static final Duration EXPIRY_MARGIN = Duration.ofSeconds(60);

    private final String clientId;
    private final String clientSecret;
    private final String refreshToken;
    private final String fromAddress;
    private final String fromName;
    private final ObjectMapper mapper;
    private final HttpClient httpClient =
            HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    private volatile String accessToken;
    private volatile Instant accessTokenExpiry = Instant.EPOCH;

    public EmailService(
            @Value("${GMAIL_CLIENT_ID:}") String clientId,
            @Value("${GMAIL_CLIENT_SECRET:}") String clientSecret,
            @Value("${GMAIL_REFRESH_TOKEN:}") String refreshToken,
            @Value("${GMAIL_FROM_ADDRESS:}") String fromAddress,
            @Value("${GMAIL_FROM_NAME:KEV Exam Verification}") String fromName,
            ObjectMapper mapper) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.refreshToken = refreshToken;
        this.fromAddress = fromAddress;
        this.fromName = fromName;
        this.mapper = mapper;
    }

    /** Fire-and-forget: a mail failure must never fail the admin request that triggered it. */
    public void send(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            log.warn("Email skipped [{}]: no recipient address", subject);
            return;
        }
        if (!configured()) {
            log.info("Gmail not configured; would send to {} [Subject: {}]:\n{}", to, subject, body);
            return;
        }
        accessToken().thenCompose(token -> dispatch(token, to, subject, body)).exceptionally(ex -> {
            log.warn("Gmail dispatch to {} failed: {}", to, ex.getMessage());
            return null;
        });
    }

    boolean configured() {
        return !refreshToken.isBlank() && !clientId.isBlank() && !clientSecret.isBlank() && !fromAddress.isBlank();
    }

    /** Exchanges the long-lived refresh token for an access token, cached until it expires. */
    private CompletableFuture<String> accessToken() {
        String cached = accessToken;
        if (cached != null && Instant.now().isBefore(accessTokenExpiry)) {
            return CompletableFuture.completedFuture(cached);
        }
        String form = "client_id=" + encode(clientId)
                + "&client_secret=" + encode(clientSecret)
                + "&refresh_token=" + encode(refreshToken)
                + "&grant_type=refresh_token";
        HttpRequest request = HttpRequest.newBuilder(TOKEN_URI)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .timeout(Duration.ofSeconds(10))
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .build();
        return httpClient
                .sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> {
                    if (response.statusCode() >= 300) {
                        throw new IllegalStateException("token endpoint returned " + response.statusCode());
                    }
                    JsonNode json = readTree(response.body());
                    String token = json.path("access_token").asString(null);
                    if (token == null) {
                        throw new IllegalStateException("token endpoint returned no access_token");
                    }
                    accessToken = token;
                    accessTokenExpiry = Instant.now()
                            .plusSeconds(json.path("expires_in").asLong(3600))
                            .minus(EXPIRY_MARGIN);
                    return token;
                });
    }

    private CompletableFuture<Void> dispatch(String token, String to, String subject, String body) {
        String raw = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(mime(to, subject, body).getBytes(StandardCharsets.UTF_8));
        HttpRequest request = HttpRequest.newBuilder(SEND_URI)
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(10))
                .POST(HttpRequest.BodyPublishers.ofString("{\"raw\":\"" + raw + "\"}"))
                .build();
        return httpClient
                .sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenAccept(response -> {
                    if (response.statusCode() >= 300) {
                        log.warn("Gmail send to {} returned {}: {}", to, response.statusCode(), response.body());
                    } else {
                        log.info("Gmail send to {} accepted [Subject: {}]", to, subject);
                    }
                });
    }

    /**
     * Minimal RFC 5322 message. Subject uses an RFC 2047 encoded-word and the body is base64 so
     * non-ASCII text and long lines survive transport untouched.
     */
    String mime(String to, String subject, String body) {
        String encodedBody = Base64.getMimeEncoder().encodeToString(body.getBytes(StandardCharsets.UTF_8));
        return "From: " + fromName + " <" + fromAddress + ">\r\n"
                + "To: " + to + "\r\n"
                + "Subject: " + encodeWord(subject) + "\r\n"
                + "MIME-Version: 1.0\r\n"
                + "Content-Type: text/plain; charset=\"UTF-8\"\r\n"
                + "Content-Transfer-Encoding: base64\r\n\r\n"
                + encodedBody;
    }

    private static String encodeWord(String value) {
        return "=?UTF-8?B?" + Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8)) + "?=";
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private JsonNode readTree(String json) {
        try {
            return mapper.readTree(json);
        } catch (Exception ex) {
            throw new IllegalStateException("unreadable token response", ex);
        }
    }
}
