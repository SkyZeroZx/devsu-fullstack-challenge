package com.devsu.banking.infrastructure.persistence;

import com.devsu.banking.domain.model.Client;
import com.devsu.banking.domain.repository.ClientRepository;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaClientRepository extends JpaRepository<Client, Long>, ClientRepository {

    @Override
    Optional<Client> findByClienteId(String clienteId);

    @Override
    @Query(
            "SELECT c FROM Client c "
                    + "WHERE LOWER(c.nombre) LIKE LOWER(CONCAT('%', :search, '%')) "
                    + "OR LOWER(c.identificacion) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Client> search(@Param("search") String search, Pageable pageable);
}
