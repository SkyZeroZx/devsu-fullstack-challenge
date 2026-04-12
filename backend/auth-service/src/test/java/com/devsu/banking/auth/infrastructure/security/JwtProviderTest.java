package com.devsu.banking.auth.infrastructure.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class JwtProviderTest {

    private static final String SECRET =
            "test-secret-key-for-unit-tests-must-be-at-least-256-bits-long-enough";
    private static final long EXPIRATION_MS = 3600000L;

    private JwtProvider jwtProvider;

    @BeforeEach
    void setUp() {
        jwtProvider = new JwtProvider(SECRET, EXPIRATION_MS);
    }

    @Test
    @DisplayName("Should generate a non-null token")
    void generateToken_returnsNonNullToken() {
        String token = jwtProvider.generateToken("testuser", "USER");

        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    @DisplayName("Should extract correct username from token")
    void getUsernameFromToken_returnsCorrectUsername() {
        String token = jwtProvider.generateToken("testuser", "USER");

        String username = jwtProvider.getUsernameFromToken(token);

        assertThat(username).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Should extract correct role from token")
    void getRoleFromToken_returnsCorrectRole() {
        String token = jwtProvider.generateToken("testuser", "ADMIN");

        String role = jwtProvider.getRoleFromToken(token);

        assertThat(role).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("Should return true for a valid token")
    void validateToken_validToken_returnsTrue() {
        String token = jwtProvider.generateToken("testuser", "USER");

        boolean isValid = jwtProvider.validateToken(token);

        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should return false for an invalid token")
    void validateToken_invalidToken_returnsFalse() {
        boolean isValid = jwtProvider.validateToken("this.is.not.a.valid.jwt");

        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should return false for an expired token")
    void validateToken_expiredToken_returnsFalse() throws InterruptedException {
        JwtProvider shortLivedProvider = new JwtProvider(SECRET, 1L);
        String token = shortLivedProvider.generateToken("testuser", "USER");

        Thread.sleep(50);

        boolean isValid = shortLivedProvider.validateToken(token);

        assertThat(isValid).isFalse();
    }
}
