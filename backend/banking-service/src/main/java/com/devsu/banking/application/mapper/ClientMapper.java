package com.devsu.banking.application.mapper;

import com.devsu.banking.application.dto.ClientRequestDTO;
import com.devsu.banking.application.dto.ClientResponseDTO;
import com.devsu.banking.domain.model.Client;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ClientMapper {

    ClientResponseDTO toResponseDTO(Client client);

    Client toEntity(ClientRequestDTO dto);

    @Mapping(target = "contrasena", ignore = true)
    void updateEntity(@MappingTarget Client client, ClientRequestDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "contrasena", ignore = true)
    void partialUpdateEntity(@MappingTarget Client client, ClientRequestDTO dto);
}
