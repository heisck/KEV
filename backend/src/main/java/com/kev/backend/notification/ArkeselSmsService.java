package com.kev.backend.notification;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ArkeselSmsService {

    private static final Logger log = LoggerFactory.getLogger(ArkeselSmsService.class);
    private final String apiKey;
    private final String senderId;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public ArkeselSmsService(
            @Value("${ARKESEL_API_KEY:}") String apiKey,
            @Value("${ARKESEL_SENDER_ID:KEV-EXAM}") String senderId) {
        this.apiKey = apiKey;
        this.senderId = senderId;
    }

    public void sendSms(String phone, String message) {
        log.info("Sending SMS (Arkesel) to {}: {}", phone, message);
        if (apiKey == null || apiKey.isBlank() || phone == null || phone.isBlank()) {
            log.debug("Arkesel API key or phone not set; skipping live HTTP SMS dispatch.");
            return;
        }
        try {
            String jsonPayload = String.format(
                    "{\"sender\": \"%s\", \"message\": \"%s\", \"recipients\": [\"%s\"]}",
                    escapeJson(senderId), escapeJson(message), escapeJson(phone));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://sms.arkesel.com/api/v2/sms/send"))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(response -> log.info("Arkesel SMS API status: {}", response.statusCode()))
                    .exceptionally(ex -> {
                        log.warn("Arkesel SMS dispatch failed: {}", ex.getMessage());
                        return null;
                    });
        } catch (Exception ex) {
            log.warn("Exception during Arkesel SMS dispatch: {}", ex.getMessage());
        }
    }

    public void sendEmail(String email, String subject, String body) {
        log.info("Sending Email to {} [Subject: {}]:\n{}", email, subject, body);
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
