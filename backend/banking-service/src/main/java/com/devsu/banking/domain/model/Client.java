package com.devsu.banking.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

@Entity
@Table(name = "cliente")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Client extends Person {

    @Generated(event = EventType.INSERT)
    @ColumnDefault("gen_random_uuid()::varchar")
    @Column(
            name = "cliente_id",
            nullable = false,
            unique = true,
            insertable = false,
            updatable = false)
    private String clienteId;

    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String contrasena;

    @NotNull(message = "Status is required")
    @Column(nullable = false)
    private Boolean estado;
}
