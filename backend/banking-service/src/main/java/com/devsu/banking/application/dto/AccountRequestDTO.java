package com.devsu.banking.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountRequestDTO {

    @NotBlank(message = "Account number is required")
    private String numeroCuenta;

    @NotBlank(message = "Account type is required")
    private String tipoCuenta;

    @NotNull(message = "Initial balance is required")
    @PositiveOrZero(message = "Initial balance cannot be negative")
    private BigDecimal saldoInicial;

    @NotNull(message = "Status is required")
    private Boolean estado;

    @NotBlank(message = "Client ID is required")
    private String clienteId;
}
