package com.devsu.banking.application.service;

import com.devsu.banking.application.dto.ClientRequestDTO;
import com.devsu.banking.application.dto.ClientResponseDTO;
import com.devsu.banking.application.dto.PagedResponseDTO;
import com.devsu.banking.application.mapper.ClientMapper;
import com.devsu.banking.domain.exception.ResourceNotFoundException;
import com.devsu.banking.domain.model.Client;
import com.devsu.banking.domain.port.PasswordEncoderPort;
import com.devsu.banking.domain.repository.ClientRepository;
import com.devsu.banking.infrastructure.config.CacheNames;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;
    private final PasswordEncoderPort passwordEncoder;
    private final ClientMapper clientMapper;

    @Cacheable(
            value = CacheNames.CLIENTS_LIST,
            key = "#search + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    @Transactional(readOnly = true)
    public PagedResponseDTO<ClientResponseDTO> findAll(String search, Pageable pageable) {
        String term = StringUtils.hasText(search) ? search : "";
        return PagedResponseDTO.from(
                clientRepository.search(term, pageable).map(clientMapper::toResponseDTO));
    }

    @Cacheable(value = CacheNames.CLIENTS, key = "#clienteId")
    @Transactional(readOnly = true)
    public ClientResponseDTO findByClienteId(String clienteId) {
        Client client = findClientByClienteId(clienteId);
        return clientMapper.toResponseDTO(client);
    }

    @Caching(
            put = {@CachePut(value = CacheNames.CLIENTS, key = "#result.clienteId")},
            evict = {@CacheEvict(value = CacheNames.CLIENTS_LIST, allEntries = true)})
    public ClientResponseDTO create(ClientRequestDTO request) {
        log.info("Creating client with identification: {}", request.getIdentificacion());

        Client client = clientMapper.toEntity(request);
        client.setContrasena(passwordEncoder.encode(request.getContrasena()));

        Client saved = clientRepository.save(client);
        log.info("Client created successfully with clienteId: {}", saved.getClienteId());
        return clientMapper.toResponseDTO(saved);
    }

    @Caching(
            put = {@CachePut(value = CacheNames.CLIENTS, key = "#clienteId")},
            evict = {@CacheEvict(value = CacheNames.CLIENTS_LIST, allEntries = true)})
    public ClientResponseDTO update(String clienteId, ClientRequestDTO request) {
        log.info("Updating client: {}", clienteId);

        Client client = findClientByClienteId(clienteId);
        clientMapper.updateEntity(client, request);

        if (request.getContrasena() != null && !request.getContrasena().isBlank()) {
            client.setContrasena(passwordEncoder.encode(request.getContrasena()));
        }

        Client updated = clientRepository.save(client);
        return clientMapper.toResponseDTO(updated);
    }

    @Caching(
            put = {@CachePut(value = CacheNames.CLIENTS, key = "#clienteId")},
            evict = {@CacheEvict(value = CacheNames.CLIENTS_LIST, allEntries = true)})
    public ClientResponseDTO partialUpdate(String clienteId, ClientRequestDTO request) {
        log.info("Partially updating client: {}", clienteId);

        Client client = findClientByClienteId(clienteId);
        clientMapper.partialUpdateEntity(client, request);

        if (request.getContrasena() != null && !request.getContrasena().isBlank()) {
            client.setContrasena(passwordEncoder.encode(request.getContrasena()));
        }

        Client updated = clientRepository.save(client);
        return clientMapper.toResponseDTO(updated);
    }

    @Caching(
            evict = {
                @CacheEvict(value = CacheNames.CLIENTS, key = "#clienteId"),
                @CacheEvict(value = CacheNames.CLIENTS_LIST, allEntries = true)
            })
    public void delete(String clienteId) {
        log.info("Deleting client: {}", clienteId);
        Client client = findClientByClienteId(clienteId);
        clientRepository.delete(client);
    }

    public Client findClientByClienteId(String clienteId) {
        return clientRepository
                .findByClienteId(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "clienteId", clienteId));
    }
}
