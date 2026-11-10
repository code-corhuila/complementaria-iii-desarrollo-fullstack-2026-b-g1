package com.ejemplo.productos.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Credenciales enviadas al endpoint de login.
 */
public record LoginRequest(
        @NotBlank(message = "El usuario es obligatorio") String username,
        @NotBlank(message = "La contraseña es obligatoria") String password) {
}
