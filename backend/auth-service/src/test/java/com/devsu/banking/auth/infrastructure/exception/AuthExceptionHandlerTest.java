package com.devsu.banking.auth.infrastructure.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

@ExtendWith(MockitoExtension.class)
class AuthExceptionHandlerTest {

    private AuthExceptionHandler exceptionHandler;

    @Mock private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new AuthExceptionHandler();
        when(request.getRequestURI()).thenReturn("/auth/login");
    }

    @Test
    @DisplayName("Should return 401 for bad credentials")
    void handleBadCredentials_returns401() {
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");

        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleBadCredentials(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("message")).isEqualTo("Invalid username or password");
        assertThat(response.getBody().get("status")).isEqualTo(401);
        assertThat(response.getBody().get("path")).isEqualTo("/auth/login");
    }

    @Test
    @DisplayName("Should return 403 for disabled account")
    void handleDisabled_returns403() {
        DisabledException ex = new DisabledException("User is disabled");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleDisabled(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("message")).isEqualTo("Account is disabled");
        assertThat(response.getBody().get("status")).isEqualTo(403);
    }

    @Test
    @DisplayName("Should return 400 for illegal argument")
    void handleIllegalArgument_returns400() {
        IllegalArgumentException ex =
                new IllegalArgumentException("Username already exists: testuser");

        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleIllegalArgument(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("message"))
                .isEqualTo("Username already exists: testuser");
        assertThat(response.getBody().get("status")).isEqualTo(400);
    }

    @Test
    @DisplayName("Should return 400 with validation errors")
    @SuppressWarnings("unchecked")
    void handleValidation_returns400WithErrors() {
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError =
                new FieldError("authRequestDTO", "username", "Username is required");
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        MethodArgumentNotValidException ex =
                new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleValidation(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("error")).isEqualTo("Validation error");

        Map<String, String> validationErrors =
                (Map<String, String>) response.getBody().get("validationErrors");
        assertThat(validationErrors).containsEntry("username", "Username is required");
    }

    @Test
    @DisplayName("Should return 500 for unexpected errors")
    void handleGeneral_returns500() {
        Exception ex = new RuntimeException("Something went wrong");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleGeneral(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("message")).isEqualTo("Internal server error");
        assertThat(response.getBody().get("status")).isEqualTo(500);
    }
}
