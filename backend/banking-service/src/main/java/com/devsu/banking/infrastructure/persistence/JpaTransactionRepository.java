package com.devsu.banking.infrastructure.persistence;

import com.devsu.banking.domain.model.Transaction;
import com.devsu.banking.domain.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaTransactionRepository
        extends JpaRepository<Transaction, Long>, TransactionRepository {

    @Override
    List<Transaction> findByCuentaIdAndFechaBetween(
            Long cuentaId, LocalDateTime start, LocalDateTime end);

    @Override
    @Query(
            "SELECT COALESCE(SUM(t.valor), 0) FROM Transaction t "
                    + "WHERE t.cuenta.id = :accountId")
    BigDecimal sumAmountByAccountId(@Param("accountId") Long accountId);

    @Override
    @Query(
            "SELECT COALESCE(SUM(ABS(t.valor)), 0) FROM Transaction t "
                    + "WHERE t.cuenta.cliente.id = :clientId "
                    + "AND t.tipoMovimiento = com.devsu.banking.domain.model.TransactionType.DEBITO "
                    + "AND t.fecha BETWEEN :start AND :end")
    BigDecimal sumDailyWithdrawalsByClientId(
            @Param("clientId") Long clientId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Override
    @Query(
            "SELECT t FROM Transaction t JOIN t.cuenta c "
                    + "WHERE LOWER(c.numeroCuenta) LIKE LOWER(CONCAT('%', :search, '%')) "
                    + "OR LOWER(CAST(t.tipoMovimiento AS string)) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Transaction> search(@Param("search") String search, Pageable pageable);

    @Override
    @Query(
            value =
                    "SELECT t FROM Transaction t "
                            + "JOIN FETCH t.cuenta a JOIN FETCH a.cliente c "
                            + "WHERE t.fecha BETWEEN :start AND :end "
                            + "AND (:clienteId IS NULL OR c.clienteId = :clienteId)",
            countQuery =
                    "SELECT COUNT(t) FROM Transaction t "
                            + "JOIN t.cuenta a JOIN a.cliente c "
                            + "WHERE t.fecha BETWEEN :start AND :end "
                            + "AND (:clienteId IS NULL OR c.clienteId = :clienteId)")
    Page<Transaction> findPagedReport(
            @Param("clienteId") String clienteId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable);
}
