package com.devsu.banking.auth.infrastructure.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.devsu.banking.auth.application.dto.AuthRequestDTO;
import com.devsu.banking.auth.application.dto.AuthResponseDTO;
import com.devsu.banking.auth.application.dto.TokenValidationResponseDTO;
import com.devsu.banking.auth.application.service.AuthService;
import com.devsu.banking.auth.infrastructure.exception.AuthExceptionHandler;
import com.devsu.banking.auth.infrastructure.security.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@Import({AuthExceptionHandler.class, SecurityConfig.class})
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private AuthService authService;

    @Test
    @DisplayName("POST /auth/login - Should return 200 with token on success")
    void login_success_returnsOk() throws Exception {
        AuthRequestDTO request =
                AuthRequestDTO.builder().username("testuser").password("password123").build();

        AuthResponseDTO response =
                AuthResponseDTO.builder()
                        .token("jwt-token-123")
                        .username("testuser")
                        .role("USER")
                        .build();

        when(authService.login(any(AuthRequestDTO.class))).thenReturn(response);

        mockMvc.perform(
                        post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-123"))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("POST /auth/login - Should return 401 on bad credentials")
    void login_badCredentials_returns401() throws Exception {
        AuthRequestDTO request =
                AuthRequestDTO.builder().username("testuser").password("wrongpassword").build();

        when(authService.login(any(AuthRequestDTO.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(
                        post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    @DisplayName("POST /auth/register - Should return 201 on success")
    void register_success_returnsCreated() throws Exception {
        AuthRequestDTO request =
                AuthRequestDTO.builder().username("newuser").password("password123").build();

        AuthResponseDTO response =
                AuthResponseDTO.builder()
                        .token("jwt-token-456")
                        .username("newuser")
                        .role("USER")
                        .build();

        when(authService.register(any(AuthRequestDTO.class))).thenReturn(response);

        mockMvc.perform(
                        post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token-456"))
                .andExpect(jsonPath("$.username").value("newuser"));
    }

    @Test
    @DisplayName("POST /auth/register - Should return 400 when username exists")
    void register_usernameExists_returns400() throws Exception {
        AuthRequestDTO request =
                AuthRequestDTO.builder().username("existing").password("password123").build();

        when(authService.register(any(AuthRequestDTO.class)))
                .thenThrow(new IllegalArgumentException("Username already exists: existing"));

        mockMvc.perform(
                        post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Username already exists: existing"));
    }

    @Test
    @DisplayName("POST /auth/register - Should return 400 on validation failure")
    void register_validationFailed_returns400() throws Exception {
        AuthRequestDTO request = AuthRequestDTO.builder().username("").password("").build();

        mockMvc.perform(
                        post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors").exists());
    }

    @Test
    @DisplayName("GET /auth/validate - Should return 200 with valid token info")
    void validate_validToken_returnsOk() throws Exception {
        TokenValidationResponseDTO response =
                TokenValidationResponseDTO.builder()
                        .valid(true)
                        .username("testuser")
                        .role("USER")
                        .build();

        when(authService.validateToken(anyString())).thenReturn(response);

        mockMvc.perform(get("/auth/validate").param("token", "valid-jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.role").value("USER"));
    }
}
