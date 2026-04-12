package com.devsu.banking.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cuenta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Account number is required")
    @Column(name = "numero_cuenta", nullable = false, unique = true)
    private String numeroCuenta;

    @NotNull(message = "Account type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cuenta", nullable = false)
    private AccountType tipoCuenta;

    @NotNull(message = "Initial balance is required")
    @Column(name = "saldo_inicial", nullable = false, precision = 15, scale = 2)
    private BigDecimal saldoInicial;

    @NotNull(message = "Status is required")
    @Column(nullable = false)
    private Boolean estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", referencedColumnName = "id", nullable = false)
    private Client cliente;
}
