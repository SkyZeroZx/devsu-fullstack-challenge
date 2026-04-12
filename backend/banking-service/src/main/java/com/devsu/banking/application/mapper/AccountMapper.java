package com.devsu.banking.application.mapper;

import com.devsu.banking.application.dto.AccountRequestDTO;
import com.devsu.banking.application.dto.AccountResponseDTO;
import com.devsu.banking.domain.model.Account;
import com.devsu.banking.domain.model.AccountType;
import com.devsu.banking.domain.model.Client;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface AccountMapper {

    @Mapping(target = "tipoCuenta", source = "tipoCuenta", qualifiedByName = "formatAccountType")
    @Mapping(target = "cliente", source = "cliente.nombre")
    AccountResponseDTO toResponseDTO(Account account);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tipoCuenta", source = "dto.tipoCuenta", qualifiedByName = "parseAccountType")
    @Mapping(target = "numeroCuenta", source = "dto.numeroCuenta")
    @Mapping(target = "saldoInicial", source = "dto.saldoInicial")
    @Mapping(target = "estado", source = "dto.estado")
    @Mapping(target = "cliente", source = "client")
    Account toEntity(AccountRequestDTO dto, Client client);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cliente", ignore = true)
    @Mapping(target = "tipoCuenta", source = "tipoCuenta", qualifiedByName = "parseAccountType")
    void updateEntity(@MappingTarget Account account, AccountRequestDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cliente", ignore = true)
    @Mapping(target = "tipoCuenta", source = "tipoCuenta", qualifiedByName = "parseAccountType")
    void partialUpdateEntity(@MappingTarget Account account, AccountRequestDTO dto);

    @Named("parseAccountType")
    default AccountType parseAccountType(String type) {
        if (type == null) {
            return null;
        }
        String normalized = type.trim().toUpperCase();
        return switch (normalized) {
            case "AHORRO", "AHORROS" -> AccountType.AHORRO;
            case "CORRIENTE" -> AccountType.CORRIENTE;
            default -> AccountType.valueOf(normalized);
        };
    }

    @Named("formatAccountType")
    default String formatAccountType(AccountType type) {
        return switch (type) {
            case AHORRO -> "Ahorros";
            case CORRIENTE -> "Corriente";
        };
    }
}
