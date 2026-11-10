package com.ejemplo.productos.auth.dto;

/**
 * Respuesta del login: el token y como usarlo.
 */
public record LoginResponse(String token, String tokenType, long expiresIn, String username) {
}
