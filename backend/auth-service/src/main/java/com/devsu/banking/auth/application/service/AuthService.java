package com.devsu.banking.auth.application.service;

import com.devsu.banking.auth.application.dto.AuthRequestDTO;
import com.devsu.banking.auth.application.dto.AuthResponseDTO;
import com.devsu.banking.auth.application.dto.TokenValidationResponseDTO;
import com.devsu.banking.auth.domain.model.AuthUser;
import com.devsu.banking.auth.domain.model.Role;
import com.devsu.banking.auth.domain.port.AuthenticationPort;
import com.devsu.banking.auth.domain.port.PasswordEncoderPort;
import com.devsu.banking.auth.domain.port.TokenPort;
import com.devsu.banking.auth.domain.repository.AuthUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoderPort passwordEncoder;
    private final TokenPort tokenProvider;
    private final AuthenticationPort authenticationPort;

    public AuthResponseDTO login(AuthRequestDTO request) {
        log.info("Login attempt for user: {}", request.getUsername());

        String authenticatedUsername =
                authenticationPort.authenticate(request.getUsername(), request.getPassword());

        AuthUser user =
                authUserRepository
                        .findByUsername(authenticatedUsername)
                        .orElseThrow(
                                () -> new RuntimeException("User not found after authentication"));

        String token = tokenProvider.generateToken(user.getUsername(), user.getRole().name());

        log.info("User '{}' authenticated successfully", user.getUsername());
        return AuthResponseDTO.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponseDTO register(AuthRequestDTO request) {
        log.info("Registering new user: {}", request.getUsername());

        if (authUserRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + request.getUsername());
        }

        AuthUser user =
                AuthUser.builder()
                        .username(request.getUsername())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .role(Role.USER)
                        .enabled(true)
                        .build();

        AuthUser saved = authUserRepository.save(user);

        String token = tokenProvider.generateToken(saved.getUsername(), saved.getRole().name());

        log.info("User '{}' registered successfully", saved.getUsername());
        return AuthResponseDTO.builder()
                .token(token)
                .username(saved.getUsername())
                .role(saved.getRole().name())
                .build();
    }

    @Transactional(readOnly = true)
    public TokenValidationResponseDTO validateToken(String token) {
        if (tokenProvider.validateToken(token)) {
            return TokenValidationResponseDTO.builder()
                    .valid(true)
                    .username(tokenProvider.getUsernameFromToken(token))
                    .role(tokenProvider.getRoleFromToken(token))
                    .build();
        }

        return TokenValidationResponseDTO.builder().valid(false).build();
    }
}
