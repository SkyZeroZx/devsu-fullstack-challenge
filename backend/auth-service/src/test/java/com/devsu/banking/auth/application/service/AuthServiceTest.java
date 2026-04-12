package com.devsu.banking.auth.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.devsu.banking.auth.application.dto.AuthRequestDTO;
import com.devsu.banking.auth.application.dto.AuthResponseDTO;
import com.devsu.banking.auth.application.dto.TokenValidationResponseDTO;
import com.devsu.banking.auth.domain.model.AuthUser;
import com.devsu.banking.auth.domain.model.Role;
import com.devsu.banking.auth.domain.port.AuthenticationPort;
import com.devsu.banking.auth.domain.port.PasswordEncoderPort;
import com.devsu.banking.auth.domain.port.TokenPort;
import com.devsu.banking.auth.domain.repository.AuthUserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AuthUserRepository authUserRepository;

    @Mock private PasswordEncoderPort passwordEncoder;

    @Mock private TokenPort tokenProvider;

    @Mock private AuthenticationPort authenticationPort;

    @InjectMocks private AuthService authService;

    private AuthRequestDTO requestDTO;
    private AuthUser authUser;

    @BeforeEach
    void setUp() {
        requestDTO = AuthRequestDTO.builder().username("testuser").password("password123").build();

        authUser =
                AuthUser.builder()
                        .id(1L)
                        .username("testuser")
                        .password("$2a$10$encoded")
                        .role(Role.USER)
                        .enabled(true)
                        .build();
    }

    @Test
    @DisplayName("Should login successfully and return token")
    void login_success() {
        when(authenticationPort.authenticate("testuser", "password123")).thenReturn("testuser");
        when(authUserRepository.findByUsername("testuser")).thenReturn(Optional.of(authUser));
        when(tokenProvider.generateToken("testuser", "USER")).thenReturn("jwt-token-123");

        AuthResponseDTO response = authService.login(requestDTO);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token-123");
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getRole()).isEqualTo("USER");
        verify(authenticationPort).authenticate("testuser", "password123");
        verify(tokenProvider).generateToken("testuser", "USER");
    }

    @Test
    @DisplayName("Should throw exception when user not found after authentication")
    void login_userNotFoundAfterAuth_throwsException() {
        when(authenticationPort.authenticate("testuser", "password123")).thenReturn("testuser");
        when(authUserRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(requestDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found after authentication");
    }

    @Test
    @DisplayName("Should register a new user successfully")
    void register_success() {
        when(authUserRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$encoded");
        when(authUserRepository.save(any(AuthUser.class))).thenReturn(authUser);
        when(tokenProvider.generateToken("testuser", "USER")).thenReturn("jwt-token-123");

        AuthResponseDTO response = authService.register(requestDTO);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token-123");
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getRole()).isEqualTo("USER");
        verify(authUserRepository).save(any(AuthUser.class));
        verify(passwordEncoder).encode("password123");
    }

    @Test
    @DisplayName("Should throw exception when username already exists")
    void register_usernameAlreadyExists_throwsException() {
        when(authUserRepository.existsByUsername("testuser")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(requestDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username already exists");
    }

    @Test
    @DisplayName("Should return valid response when token is valid")
    void validateToken_validToken_returnsValid() {
        when(tokenProvider.validateToken("valid-token")).thenReturn(true);
        when(tokenProvider.getUsernameFromToken("valid-token")).thenReturn("testuser");
        when(tokenProvider.getRoleFromToken("valid-token")).thenReturn("USER");

        TokenValidationResponseDTO response = authService.validateToken("valid-token");

        assertThat(response).isNotNull();
        assertThat(response.isValid()).isTrue();
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getRole()).isEqualTo("USER");
    }

    @Test
    @DisplayName("Should return invalid response when token is invalid")
    void validateToken_invalidToken_returnsInvalid() {
        when(tokenProvider.validateToken("invalid-token")).thenReturn(false);

        TokenValidationResponseDTO response = authService.validateToken("invalid-token");

        assertThat(response).isNotNull();
        assertThat(response.isValid()).isFalse();
        assertThat(response.getUsername()).isNull();
        assertThat(response.getRole()).isNull();
    }
}
