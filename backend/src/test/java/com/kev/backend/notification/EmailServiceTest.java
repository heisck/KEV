package com.kev.backend.notification;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class EmailServiceTest {

    private static EmailService service(String refreshToken) {
        return new EmailService(
                "client-id", "client-secret", refreshToken, "exams@example.com", "KEV", new ObjectMapper());
    }

    @Test
    void isNotConfiguredWithoutARefreshToken() {
        assertThat(service("").configured()).isFalse();
    }

    @Test
    void isConfiguredOnceEveryCredentialIsPresent() {
        assertThat(service("refresh-token").configured()).isTrue();
    }

    @Test
    void sendingWithoutConfigurationDoesNotThrow() {
        service("").send("lecturer@example.com", "Welcome", "Password: ABC123");
    }

    @Test
    void sendingWithoutARecipientDoesNotThrow() {
        service("refresh-token").send(null, "Welcome", "Password: ABC123");
    }

    @Test
    void mimeCarriesTheEnvelopeHeaders() {
        String mime = service("refresh-token").mime("lecturer@example.com", "Welcome", "hi");

        assertThat(mime)
                .contains("From: KEV <exams@example.com>\r\n")
                .contains("To: lecturer@example.com\r\n")
                .contains("Content-Transfer-Encoding: base64");
    }

    @Test
    void mimeEncodesSubjectAndBodySoNonAsciiSurvives() {
        String mime = service("refresh-token").mime("lecturer@example.com", "Café ☕", "Pass: Ω99\nline two");

        assertThat(mime).contains("Subject: =?UTF-8?B?" + base64("Café ☕") + "?=");
        String body = mime.substring(mime.indexOf("\r\n\r\n") + 4).replace("\r\n", "");
        assertThat(new String(Base64.getDecoder().decode(body), StandardCharsets.UTF_8))
                .isEqualTo("Pass: Ω99\nline two");
    }

    private static String base64(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }
}
