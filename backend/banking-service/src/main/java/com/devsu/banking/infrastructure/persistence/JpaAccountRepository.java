package com.devsu.banking.infrastructure.persistence;

import com.devsu.banking.domain.model.Account;
import com.devsu.banking.domain.repository.AccountRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaAccountRepository extends JpaRepository<Account, Long>, AccountRepository {

    @Override
    Optional<Account> findByNumeroCuenta(String numeroCuenta);

    @Override
    List<Account> findByClienteId(Long clienteId);
}
