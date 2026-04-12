package com.devsu.banking.infrastructure.controller;

import com.devsu.banking.application.dto.ClientRequestDTO;
import com.devsu.banking.application.dto.ClientResponseDTO;
import com.devsu.banking.application.dto.PagedResponseDTO;
import com.devsu.banking.application.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    public ResponseEntity<PagedResponseDTO<ClientResponseDTO>> listAll(
            @PageableDefault(size = 20, sort = "nombre", direction = Sort.Direction.ASC)
                    Pageable pageable) {
        return ResponseEntity.ok(clientService.findAll(pageable));
    }

    @GetMapping("/{clienteId}")
    public ResponseEntity<ClientResponseDTO> getById(@PathVariable String clienteId) {
        return ResponseEntity.ok(clientService.findByClienteId(clienteId));
    }

    @PostMapping
    public ResponseEntity<ClientResponseDTO> create(@Valid @RequestBody ClientRequestDTO request) {
        ClientResponseDTO response = clientService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{clienteId}")
    public ResponseEntity<ClientResponseDTO> update(
            @PathVariable String clienteId, @Valid @RequestBody ClientRequestDTO request) {
        return ResponseEntity.ok(clientService.update(clienteId, request));
    }

    @PatchMapping("/{clienteId}")
    public ResponseEntity<ClientResponseDTO> partialUpdate(
            @PathVariable String clienteId, @RequestBody ClientRequestDTO request) {
        return ResponseEntity.ok(clientService.partialUpdate(clienteId, request));
    }

    @DeleteMapping("/{clienteId}")
    public ResponseEntity<Void> delete(@PathVariable String clienteId) {
        clientService.delete(clienteId);
        return ResponseEntity.noContent().build();
    }
}
