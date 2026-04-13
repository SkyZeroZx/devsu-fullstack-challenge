package com.devsu.banking.domain.repository;

import com.devsu.banking.domain.model.Transaction;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TransactionRepository {

    Page<Transaction> search(String search, Pageable pageable);

    Optional<Transaction> findById(Long id);

    List<Transaction> findByCuentaIdAndFechaBetween(
            Long cuentaId, LocalDateTime start, LocalDateTime end);

    BigDecimal sumAmountByAccountId(Long accountId);

    BigDecimal sumDailyWithdrawalsByClientId(Long clientId, LocalDateTime start, LocalDateTime end);

    Transaction save(Transaction transaction);

    void delete(Transaction transaction);
}
