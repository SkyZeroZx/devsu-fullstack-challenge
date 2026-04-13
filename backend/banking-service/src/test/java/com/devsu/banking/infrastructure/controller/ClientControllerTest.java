package com.devsu.banking.infrastructure.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.devsu.banking.application.dto.ClientRequestDTO;
import com.devsu.banking.application.dto.ClientResponseDTO;
import com.devsu.banking.application.dto.PagedResponseDTO;
import com.devsu.banking.application.service.ClientService;
import com.devsu.banking.domain.exception.ResourceNotFoundException;
import com.devsu.banking.infrastructure.exception.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
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

@WebMvcTest(ClientController.class)
@Import(GlobalExceptionHandler.class)
class ClientControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private ClientService clientService;

    @Test
    @DisplayName("GET /api/clientes - Should return list of clients")
    void listAll_returnsOk() throws Exception {
        ClientResponseDTO response =
                ClientResponseDTO.builder()
                        .clienteId("ABC12345")
                        .nombre("Jose Lema")
                        .direccion("Otavalo sn y principal")
                        .telefono("098254785")
                        .estado(true)
                        .build();

        when(clientService.findAll(any(), any(Pageable.class)))
                .thenReturn(new PagedResponseDTO<>(List.of(response), 0, 20, 1, 1, true, true));

        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].clienteId").value("ABC12345"))
                .andExpect(jsonPath("$.content[0].nombre").value("Jose Lema"));
    }

    @Test
    @DisplayName("GET /api/clientes/{id} - Should return a client")
    void getById_returnsOk() throws Exception {
        ClientResponseDTO response =
                ClientResponseDTO.builder()
                        .clienteId("ABC12345")
                        .nombre("Jose Lema")
                        .estado(true)
                        .build();

        when(clientService.findByClienteId("ABC12345")).thenReturn(response);

        mockMvc.perform(get("/api/clientes/ABC12345"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clienteId").value("ABC12345"));
    }

    @Test
    @DisplayName("GET /api/clientes/{id} - Should return 404 when not found")
    void getById_notFound_returns404() throws Exception {
        when(clientService.findByClienteId("NOTFOUND"))
                .thenThrow(new ResourceNotFoundException("Client", "clienteId", "NOTFOUND"));

        mockMvc.perform(get("/api/clientes/NOTFOUND"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("POST /api/clientes - Should create a client")
    void create_returnsCreated() throws Exception {
        ClientRequestDTO request =
                ClientRequestDTO.builder()
                        .nombre("Jose Lema")
                        .genero("Masculino")
                        .edad(30)
                        .identificacion("1234567890")
                        .direccion("Otavalo sn y principal")
                        .telefono("098254785")
                        .contrasena("1234")
                        .estado(true)
                        .build();

        ClientResponseDTO response =
                ClientResponseDTO.builder()
                        .clienteId("ABC12345")
                        .nombre("Jose Lema")
                        .estado(true)
                        .build();

        when(clientService.create(any(ClientRequestDTO.class))).thenReturn(response);

        mockMvc.perform(
                        post("/api/clientes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.clienteId").value("ABC12345"))
                .andExpect(jsonPath("$.nombre").value("Jose Lema"));
    }

    @Test
    @DisplayName("POST /api/clientes - Should return 400 on validation failure")
    void create_validationFailed_returns400() throws Exception {
        ClientRequestDTO request = ClientRequestDTO.builder().nombre("").build();

        mockMvc.perform(
                        post("/api/clientes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors").exists());
    }
}
