package com.devsu.banking.application.service;

import com.devsu.banking.application.dto.TransactionRequestDTO;
import com.devsu.banking.application.dto.TransactionResponseDTO;
import com.devsu.banking.application.mapper.TransactionMapper;
import com.devsu.banking.domain.exception.DailyLimitExceededException;
import com.devsu.banking.domain.exception.InsufficientBalanceException;
import com.devsu.banking.domain.exception.ResourceNotFoundException;
import com.devsu.banking.domain.model.Account;
import com.devsu.banking.domain.model.Transaction;
import com.devsu.banking.domain.model.TransactionType;
import com.devsu.banking.domain.repository.TransactionRepository;
import com.devsu.banking.infrastructure.config.CacheNames;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final TransactionMapper transactionMapper;

    @Value("${banking.daily-withdrawal-limit:1000}")
    private BigDecimal dailyWithdrawalLimit;

    @Cacheable(
            value = CacheNames.TRANSACTIONS_LIST,
            key   = "#pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    @Transactional(readOnly = true)
    public Page<TransactionResponseDTO> findAll(Pageable pageable) {
        return transactionRepository.findAll(pageable).map(transactionMapper::toResponseDTO);
    }

    @Cacheable(value = CacheNames.TRANSACTIONS, key = "#id")
    @Transactional(readOnly = true)
    public TransactionResponseDTO findById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
        return transactionMapper.toResponseDTO(transaction);
    }

    /**
     * Registers a new transaction.
     * <p>
     * Cache strategy:
     * <ul>
     *   <li>Populates the individual transaction cache (write-through).</li>
     *   <li>Evicts paginated transaction lists.</li>
     *   <li>Evicts the affected account's individual cache – the running balance changed.</li>
     *   <li>Evicts paginated account lists.</li>
     * </ul>
     */
    @Caching(
            put   = { @CachePut(value = CacheNames.TRANSACTIONS, key = "#result.id") },
            evict = {
                    @CacheEvict(value = CacheNames.TRANSACTIONS_LIST, allEntries = true),
                    @CacheEvict(value = CacheNames.ACCOUNTS,          key = "#request.numeroCuenta"),
                    @CacheEvict(value = CacheNames.ACCOUNTS_LIST,     allEntries = true)
            }
    )
    public TransactionResponseDTO register(TransactionRequestDTO request) {
        log.info("Registering transaction on account: {}, type: {}, amount: {}",
                request.getNumeroCuenta(), request.getTipoMovimiento(), request.getValor());

        Account account = accountService.findAccountByNumber(request.getNumeroCuenta());
        TransactionType transactionType = transactionMapper.parseTransactionType(request.getTipoMovimiento());

        BigDecimal currentBalance = calculateCurrentBalance(account);

        BigDecimal transactionAmount;
        if (transactionType == TransactionType.DEBITO) {
            transactionAmount = request.getValor().negate();
            validateAvailableBalance(currentBalance, request.getValor());
            validateDailyLimit(account.getCliente().getId(), request.getValor());
        } else {
            transactionAmount = request.getValor();
        }

        BigDecimal newBalance = currentBalance.add(transactionAmount);

        Transaction transaction = Transaction.builder()
                .fecha(LocalDateTime.now())
                .tipoMovimiento(transactionType)
                .valor(transactionAmount)
                .saldo(newBalance)
                .cuenta(account)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction registered. Previous balance: {}, New balance: {}", currentBalance, newBalance);
        return transactionMapper.toResponseDTO(saved);
    }

    /**
     * Deletes a transaction.
     * <p>
     * Since we don't know which account is affected until after the lookup, we evict ALL
     * account entries – a safe but slightly broad invalidation for this rare operation.
     */
    @Caching(evict = {
            @CacheEvict(value = CacheNames.TRANSACTIONS,      key = "#id"),
            @CacheEvict(value = CacheNames.TRANSACTIONS_LIST, allEntries = true),
            @CacheEvict(value = CacheNames.ACCOUNTS,          allEntries = true),
            @CacheEvict(value = CacheNames.ACCOUNTS_LIST,     allEntries = true)
    })
    public void delete(Long id) {
        log.info("Deleting transaction: {}", id);
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
        transactionRepository.delete(transaction);
    }

    private BigDecimal calculateCurrentBalance(Account account) {
        BigDecimal totalMovements = transactionRepository.sumAmountByAccountId(account.getId());
        return account.getSaldoInicial().add(totalMovements);
    }

    private void validateAvailableBalance(BigDecimal currentBalance, BigDecimal withdrawalAmount) {
        if (currentBalance.compareTo(withdrawalAmount) < 0) {
            throw new InsufficientBalanceException();
        }
    }

    private void validateDailyLimit(Long clientId, BigDecimal withdrawalAmount) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        BigDecimal withdrawalsToday = transactionRepository.sumDailyWithdrawalsByClientId(clientId, startOfDay, endOfDay);
        BigDecimal totalWithNewWithdrawal = withdrawalsToday.add(withdrawalAmount);

        if (totalWithNewWithdrawal.compareTo(dailyWithdrawalLimit) > 0) {
            throw new DailyLimitExceededException();
        }
    }
}
