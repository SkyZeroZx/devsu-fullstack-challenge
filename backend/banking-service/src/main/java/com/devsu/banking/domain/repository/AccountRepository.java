package com.devsu.banking.domain.repository;

import com.devsu.banking.domain.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByNumeroCuenta(String numeroCuenta);

    List<Account> findByClienteId(Long clienteId);

    boolean existsByNumeroCuenta(String numeroCuenta);
}
