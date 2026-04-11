package com.devsu.banking.application.service;

import com.devsu.banking.application.dto.AccountRequestDTO;
import com.devsu.banking.application.dto.AccountResponseDTO;
import com.devsu.banking.application.mapper.AccountMapper;
import com.devsu.banking.domain.exception.ResourceNotFoundException;
import com.devsu.banking.domain.model.Account;
import com.devsu.banking.domain.model.Client;
import com.devsu.banking.domain.repository.AccountRepository;
import com.devsu.banking.infrastructure.config.CacheNames;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;
    private final ClientService clientService;
    private final AccountMapper accountMapper;

    @Cacheable(
            value = CacheNames.ACCOUNTS_LIST,
            key   = "#pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    @Transactional(readOnly = true)
    public Page<AccountResponseDTO> findAll(Pageable pageable) {
        return accountRepository.findAll(pageable).map(accountMapper::toResponseDTO);
    }

    @Cacheable(value = CacheNames.ACCOUNTS, key = "#numeroCuenta")
    @Transactional(readOnly = true)
    public AccountResponseDTO findByAccountNumber(String numeroCuenta) {
        Account account = findAccountByNumber(numeroCuenta);
        return accountMapper.toResponseDTO(account);
    }

    @Caching(
            put   = { @CachePut(value = CacheNames.ACCOUNTS, key = "#result.numeroCuenta") },
            evict = { @CacheEvict(value = CacheNames.ACCOUNTS_LIST, allEntries = true) }
    )
    public AccountResponseDTO create(AccountRequestDTO request) {
        log.info("Creating account: {} for client: {}", request.getNumeroCuenta(), request.getClienteId());

        Client client = clientService.findClientByClienteId(request.getClienteId());
        Account account = accountMapper.toEntity(request, client);

        Account saved = accountRepository.save(account);
        log.info("Account created successfully: {}", saved.getNumeroCuenta());
        return accountMapper.toResponseDTO(saved);
    }

    @Caching(
            put   = { @CachePut(value = CacheNames.ACCOUNTS, key = "#numeroCuenta") },
            evict = { @CacheEvict(value = CacheNames.ACCOUNTS_LIST, allEntries = true) }
    )
    public AccountResponseDTO update(String numeroCuenta, AccountRequestDTO request) {
        log.info("Updating account: {}", numeroCuenta);

        Account account = findAccountByNumber(numeroCuenta);
        accountMapper.updateEntity(account, request);

        if (request.getClienteId() != null) {
            Client client = clientService.findClientByClienteId(request.getClienteId());
            account.setCliente(client);
        }

        Account updated = accountRepository.save(account);
        return accountMapper.toResponseDTO(updated);
    }

    @Caching(
            put   = { @CachePut(value = CacheNames.ACCOUNTS, key = "#numeroCuenta") },
            evict = { @CacheEvict(value = CacheNames.ACCOUNTS_LIST, allEntries = true) }
    )
    public AccountResponseDTO partialUpdate(String numeroCuenta, AccountRequestDTO request) {
        log.info("Partially updating account: {}", numeroCuenta);

        Account account = findAccountByNumber(numeroCuenta);
        accountMapper.partialUpdateEntity(account, request);

        if (request.getClienteId() != null) {
            account.setCliente(clientService.findClientByClienteId(request.getClienteId()));
        }

        Account updated = accountRepository.save(account);
        return accountMapper.toResponseDTO(updated);
    }

    @Caching(evict = {
            @CacheEvict(value = CacheNames.ACCOUNTS,      key = "#numeroCuenta"),
            @CacheEvict(value = CacheNames.ACCOUNTS_LIST, allEntries = true)
    })
    public void delete(String numeroCuenta) {
        log.info("Deleting account: {}", numeroCuenta);
        Account account = findAccountByNumber(numeroCuenta);
        accountRepository.delete(account);
    }

    public Account findAccountByNumber(String numeroCuenta) {
        return accountRepository.findByNumeroCuenta(numeroCuenta)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "numeroCuenta", numeroCuenta));
    }
}
