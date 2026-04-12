package com.devsu.banking.infrastructure.persistence;

import com.devsu.banking.domain.model.Client;
import com.devsu.banking.domain.repository.ClientRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaClientRepository extends JpaRepository<Client, Long>, ClientRepository {

    @Override
    Optional<Client> findByClienteId(String clienteId);
}
