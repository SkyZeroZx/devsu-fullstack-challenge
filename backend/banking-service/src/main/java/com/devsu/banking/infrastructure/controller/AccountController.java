package com.devsu.banking.infrastructure.controller;

import com.devsu.banking.application.dto.AccountRequestDTO;
import com.devsu.banking.application.dto.AccountResponseDTO;
import com.devsu.banking.application.dto.PagedResponseDTO;
import com.devsu.banking.application.service.AccountService;
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
@RequestMapping("/api/cuentas")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<PagedResponseDTO<AccountResponseDTO>> listAll(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.ASC)
                    Pageable pageable) {
        return ResponseEntity.ok(accountService.findAll(pageable));
    }

    @GetMapping("/{numeroCuenta}")
    public ResponseEntity<AccountResponseDTO> getByAccountNumber(
            @PathVariable String numeroCuenta) {
        return ResponseEntity.ok(accountService.findByAccountNumber(numeroCuenta));
    }

    @PostMapping
    public ResponseEntity<AccountResponseDTO> create(
            @Valid @RequestBody AccountRequestDTO request) {
        AccountResponseDTO response = accountService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{numeroCuenta}")
    public ResponseEntity<AccountResponseDTO> update(
            @PathVariable String numeroCuenta, @Valid @RequestBody AccountRequestDTO request) {
        return ResponseEntity.ok(accountService.update(numeroCuenta, request));
    }

    @PatchMapping("/{numeroCuenta}")
    public ResponseEntity<AccountResponseDTO> partialUpdate(
            @PathVariable String numeroCuenta, @RequestBody AccountRequestDTO request) {
        return ResponseEntity.ok(accountService.partialUpdate(numeroCuenta, request));
    }

    @DeleteMapping("/{numeroCuenta}")
    public ResponseEntity<Void> delete(@PathVariable String numeroCuenta) {
        accountService.delete(numeroCuenta);
        return ResponseEntity.noContent().build();
    }
}
