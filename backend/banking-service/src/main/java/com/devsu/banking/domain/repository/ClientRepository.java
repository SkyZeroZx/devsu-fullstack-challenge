package com.devsu.banking.domain.repository;

import com.devsu.banking.domain.model.Client;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClientRepository {

    Page<Client> findAll(Pageable pageable);

    Optional<Client> findByClienteId(String clienteId);

    Client save(Client client);

    void delete(Client client);
}
