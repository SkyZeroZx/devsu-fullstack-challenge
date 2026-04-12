package com.devsu.banking.infrastructure.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.devsu.banking.application.dto.PagedResponseDTO;
import com.devsu.banking.application.dto.TransactionRequestDTO;
import com.devsu.banking.application.dto.TransactionResponseDTO;
import com.devsu.banking.application.service.TransactionService;
import com.devsu.banking.domain.exception.DailyLimitExceededException;
import com.devsu.banking.domain.exception.InsufficientBalanceException;
import com.devsu.banking.infrastructure.exception.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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

@WebMvcTest(TransactionController.class)
@Import(GlobalExceptionHandler.class)
class TransactionControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private TransactionService transactionService;

    @Test
    @DisplayName("POST /api/movimientos - Should register a transaction successfully")
    void register_returnsCreated() throws Exception {
        TransactionRequestDTO request =
                TransactionRequestDTO.builder()
                        .numeroCuenta("478758")
                        .tipoMovimiento("CREDITO")
                        .valor(new BigDecimal("600"))
                        .build();

        TransactionResponseDTO response =
                TransactionResponseDTO.builder()
                        .id(1L)
                        .fecha(LocalDateTime.now())
                        .tipoMovimiento("Crédito")
                        .valor(new BigDecimal("600"))
                        .saldo(new BigDecimal("2600"))
                        .numeroCuenta("478758")
                        .build();

        when(transactionService.register(any(TransactionRequestDTO.class))).thenReturn(response);

        mockMvc.perform(
                        post("/api/movimientos")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.saldo").value(2600))
                .andExpect(jsonPath("$.numeroCuenta").value("478758"));
    }

    @Test
    @DisplayName("POST /api/movimientos - Should return 400 for insufficient balance")
    void register_insufficientBalance_returns400() throws Exception {
        TransactionRequestDTO request =
                TransactionRequestDTO.builder()
                        .numeroCuenta("495878")
                        .tipoMovimiento("DEBITO")
                        .valor(new BigDecimal("100"))
                        .build();

        when(transactionService.register(any(TransactionRequestDTO.class)))
                .thenThrow(new InsufficientBalanceException());

        mockMvc.perform(
                        post("/api/movimientos")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Saldo no disponible"));
    }

    @Test
    @DisplayName("POST /api/movimientos - Should return 400 for daily limit exceeded")
    void register_dailyLimitExceeded_returns400() throws Exception {
        TransactionRequestDTO request =
                TransactionRequestDTO.builder()
                        .numeroCuenta("478758")
                        .tipoMovimiento("DEBITO")
                        .valor(new BigDecimal("500"))
                        .build();

        when(transactionService.register(any(TransactionRequestDTO.class)))
                .thenThrow(new DailyLimitExceededException());

        mockMvc.perform(
                        post("/api/movimientos")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cupo diario Excedido"));
    }

    @Test
    @DisplayName("GET /api/movimientos - Should return list of transactions")
    void listAll_returnsOk() throws Exception {
        TransactionResponseDTO response =
                TransactionResponseDTO.builder()
                        .id(1L)
                        .fecha(LocalDateTime.now())
                        .tipoMovimiento("Crédito")
                        .valor(new BigDecimal("600"))
                        .saldo(new BigDecimal("2600"))
                        .numeroCuenta("478758")
                        .build();

        when(transactionService.findAll(any(Pageable.class)))
                .thenReturn(new PagedResponseDTO<>(List.of(response), 0, 20, 1, 1, true, true));

        mockMvc.perform(get("/api/movimientos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].numeroCuenta").value("478758"));
    }
}
