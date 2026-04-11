package com.devsu.banking.application.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String nombre;

    @NotBlank(message = "Gender is required")
    private String genero;

    @NotNull(message = "Age is required")
    @Positive(message = "Age must be a positive number")
    private Integer edad;

    @NotBlank(message = "Identification is required")
    @Size(max = 20, message = "Identification cannot exceed 20 characters")
    private String identificacion;

    @NotBlank(message = "Address is required")
    private String direccion;

    @NotBlank(message = "Phone is required")
    private String telefono;

    @NotBlank(message = "Password is required")
    @Size(min = 4, message = "Password must be at least 4 characters")
    private String contrasena;

    @NotNull(message = "Status is required")
    private Boolean estado;
}
