package com.devsu.banking.application.mapper;

import com.devsu.banking.application.dto.TransactionResponseDTO;
import com.devsu.banking.domain.model.Transaction;
import com.devsu.banking.domain.model.TransactionType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface TransactionMapper {

    @Mapping(target = "tipoMovimiento", source = "tipoMovimiento", qualifiedByName = "formatTransactionType")
    @Mapping(target = "numeroCuenta", source = "cuenta.numeroCuenta")
    TransactionResponseDTO toResponseDTO(Transaction transaction);

    @Named("parseTransactionType")
    default TransactionType parseTransactionType(String type) {
        if (type == null) return null;
        String normalized = type.trim().toUpperCase();
        return switch (normalized) {
            case "CREDITO", "CRÉDITO", "DEPOSITO", "DEPÓSITO" -> TransactionType.CREDITO;
            case "DEBITO", "DÉBITO", "RETIRO" -> TransactionType.DEBITO;
            default -> TransactionType.valueOf(normalized);
        };
    }

    @Named("formatTransactionType")
    default String formatTransactionType(TransactionType type) {
        return switch (type) {
            case CREDITO -> "Crédito";
            case DEBITO -> "Débito";
        };
    }
}
