package com.devsu.banking.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "persona")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotBlank(message = "Gender is required")
    @Size(max = 20, message = "Gender cannot exceed 20 characters")
    @Column(nullable = false, length = 20)
    private String genero;

    @NotNull(message = "Age is required")
    @Positive(message = "Age must be a positive number")
    @Column(nullable = false)
    private Integer edad;

    @NotBlank(message = "Identification is required")
    @Size(max = 20, message = "Identification cannot exceed 20 characters")
    @Column(nullable = false, unique = true, length = 20)
    private String identificacion;

    @NotBlank(message = "Address is required")
    @Size(max = 200, message = "Address cannot exceed 200 characters")
    @Column(nullable = false, length = 200)
    private String direccion;

    @NotBlank(message = "Phone is required")
    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    @Column(nullable = false, length = 20)
    private String telefono;
}
