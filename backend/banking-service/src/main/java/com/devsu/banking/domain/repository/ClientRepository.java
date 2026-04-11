package com.devsu.banking.domain.repository;

import com.devsu.banking.domain.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByClienteId(String clienteId);

    Optional<Client> findByIdentificacion(String identificacion);

    boolean existsByClienteId(String clienteId);

    boolean existsByIdentificacion(String identificacion);
}
