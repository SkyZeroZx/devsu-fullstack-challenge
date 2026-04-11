package com.devsu.banking.domain.repository;

import com.devsu.banking.domain.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByCuentaId(Long cuentaId);

    List<Transaction> findByCuentaIdAndFechaBetween(Long cuentaId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transaction t " +
           "WHERE t.cuenta.id = :accountId")
    BigDecimal sumAmountByAccountId(@Param("accountId") Long accountId);

    @Query("SELECT COALESCE(SUM(ABS(t.valor)), 0) FROM Transaction t " +
           "WHERE t.cuenta.cliente.id = :clientId " +
           "AND t.tipoMovimiento = com.devsu.banking.domain.model.TransactionType.DEBITO " +
           "AND t.fecha BETWEEN :start AND :end")
    BigDecimal sumDailyWithdrawalsByClientId(
            @Param("clientId") Long clientId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
