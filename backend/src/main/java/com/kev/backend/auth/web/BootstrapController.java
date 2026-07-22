package com.kev.backend.auth.web;

import com.kev.backend.auth.AuthService;
import com.kev.backend.auth.dto.AuthResponse;
import com.kev.backend.auth.dto.BootstrapRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Initial admin bootstrap")
public class BootstrapController {

    private final AuthService auth;

    public BootstrapController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/bootstrap")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse bootstrap(@Valid @RequestBody BootstrapRequest request) {
        return auth.bootstrapAdmin(request);
    }
}
