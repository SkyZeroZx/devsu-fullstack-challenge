package com.devsu.banking.infrastructure.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.devsu.banking.application.dto.AccountRequestDTO;
import com.devsu.banking.application.dto.AccountResponseDTO;
import com.devsu.banking.application.dto.PagedResponseDTO;
import com.devsu.banking.application.service.AccountService;
import com.devsu.banking.domain.exception.ResourceNotFoundException;
import com.devsu.banking.infrastructure.exception.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AccountController.class)
@Import(GlobalExceptionHandler.class)
class AccountControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private AccountService accountService;

    private AccountRequestDTO validRequest() {
        return AccountRequestDTO.builder()
                .numeroCuenta("478758")
                .tipoCuenta("AHORRO")
                .saldoInicial(new BigDecimal("2000"))
                .estado(true)
                .clienteId("CLI-001")
                .build();
    }

    private AccountResponseDTO sampleResponse() {
        return AccountResponseDTO.builder()
                .numeroCuenta("478758")
                .tipoCuenta("AHORRO")
                .saldoInicial(new BigDecimal("2000"))
                .estado(true)
                .clienteId("CLI-001")
                .cliente("Jose Lema")
                .build();
    }

    @Test
    @DisplayName("GET /api/cuentas - Should return list of accounts")
    void listAll_returnsOk() throws Exception {
        when(accountService.findAll(any(), any(Pageable.class)))
                .thenReturn(
                        new PagedResponseDTO<>(List.of(sampleResponse()), 1, 20, 1, 1, true, true));

        mockMvc.perform(get("/api/cuentas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].numeroCuenta").value("478758"))
                .andExpect(jsonPath("$.content[0].tipoCuenta").value("AHORRO"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/cuentas?search=478 - Should pass search param to service")
    void listAll_withSearch_passesParam() throws Exception {
        when(accountService.findAll(any(), any(Pageable.class)))
                .thenReturn(
                        new PagedResponseDTO<>(List.of(sampleResponse()), 1, 20, 1, 1, true, true));

        mockMvc.perform(get("/api/cuentas").param("search", "478"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("GET /api/cuentas/{numeroCuenta} - Should return account")
    void getByAccountNumber_returnsOk() throws Exception {
        when(accountService.findByAccountNumber("478758")).thenReturn(sampleResponse());

        mockMvc.perform(get("/api/cuentas/478758"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numeroCuenta").value("478758"))
                .andExpect(jsonPath("$.tipoCuenta").value("AHORRO"))
                .andExpect(jsonPath("$.cliente").value("Jose Lema"));
    }

    @Test
    @DisplayName("GET /api/cuentas/{numeroCuenta} - Should return 404 when not found")
    void getByAccountNumber_notFound_returns404() throws Exception {
        when(accountService.findByAccountNumber("MISSING"))
                .thenThrow(new ResourceNotFoundException("Account", "numeroCuenta", "MISSING"));

        mockMvc.perform(get("/api/cuentas/MISSING"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("POST /api/cuentas - Should create account and return 201")
    void create_returnsCreated() throws Exception {
        when(accountService.create(any(AccountRequestDTO.class))).thenReturn(sampleResponse());

        mockMvc.perform(
                        post("/api/cuentas")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.numeroCuenta").value("478758"))
                .andExpect(jsonPath("$.clienteId").value("CLI-001"));
    }

    @Test
    @DisplayName("POST /api/cuentas - Should return 400 on validation failure")
    void create_validationFailed_returns400() throws Exception {
        AccountRequestDTO invalid = AccountRequestDTO.builder().build();

        mockMvc.perform(
                        post("/api/cuentas")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors").exists());
    }

    @Test
    @DisplayName("POST /api/cuentas - Should return 400 when client not found")
    void create_clientNotFound_returns404() throws Exception {
        when(accountService.create(any(AccountRequestDTO.class)))
                .thenThrow(new ResourceNotFoundException("Client", "clienteId", "CLI-001"));

        mockMvc.perform(
                        post("/api/cuentas")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("PUT /api/cuentas/{numeroCuenta} - Should update account and return 200")
    void update_returnsOk() throws Exception {
        when(accountService.update(any(), any(AccountRequestDTO.class)))
                .thenReturn(sampleResponse());

        mockMvc.perform(
                        put("/api/cuentas/478758")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numeroCuenta").value("478758"));
    }

    @Test
    @DisplayName("PUT /api/cuentas/{numeroCuenta} - Should return 404 when account not found")
    void update_notFound_returns404() throws Exception {
        when(accountService.update(any(), any(AccountRequestDTO.class)))
                .thenThrow(new ResourceNotFoundException("Account", "numeroCuenta", "MISSING"));

        mockMvc.perform(
                        put("/api/cuentas/MISSING")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("PATCH /api/cuentas/{numeroCuenta} - Should partially update account")
    void partialUpdate_returnsOk() throws Exception {
        AccountRequestDTO patch =
                AccountRequestDTO.builder()
                        .numeroCuenta(null)
                        .tipoCuenta(null)
                        .saldoInicial(null)
                        .estado(false)
                        .clienteId(null)
                        .build();

        AccountResponseDTO updated =
                AccountResponseDTO.builder()
                        .numeroCuenta("478758")
                        .tipoCuenta("AHORRO")
                        .saldoInicial(new BigDecimal("2000"))
                        .estado(false)
                        .clienteId("CLI-001")
                        .cliente("Jose Lema")
                        .build();

        when(accountService.partialUpdate(any(), any(AccountRequestDTO.class))).thenReturn(updated);

        mockMvc.perform(
                        patch("/api/cuentas/478758")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(patch)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value(false));
    }

    @Test
    @DisplayName("PATCH /api/cuentas/{numeroCuenta} - Should return 404 when account not found")
    void partialUpdate_notFound_returns404() throws Exception {
        when(accountService.partialUpdate(any(), any(AccountRequestDTO.class)))
                .thenThrow(new ResourceNotFoundException("Account", "numeroCuenta", "MISSING"));

        mockMvc.perform(
                        patch("/api/cuentas/MISSING")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                AccountRequestDTO.builder().build())))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/cuentas/{numeroCuenta} - Should delete account and return 204")
    void delete_returnsNoContent() throws Exception {
        doNothing().when(accountService).delete("478758");

        mockMvc.perform(delete("/api/cuentas/478758")).andExpect(status().isNoContent());

        verify(accountService).delete("478758");
    }

    @Test
    @DisplayName("DELETE /api/cuentas/{numeroCuenta} - Should return 404 when account not found")
    void delete_notFound_returns404() throws Exception {
        doThrow(new ResourceNotFoundException("Account", "numeroCuenta", "MISSING"))
                .when(accountService)
                .delete("MISSING");

        mockMvc.perform(delete("/api/cuentas/MISSING"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").exists());
    }
}
