package com.ejemplo.productos.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO estandarizado para las respuestas de error de la API.
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Respuesta estándar de error")
public class ErrorResponse {

    @Schema(description = "Fecha y hora del error", example = "2026-10-04T10:15:30")
    private final LocalDateTime timestamp;

    @Schema(description = "Código de estado HTTP", example = "404")
    private final int status;

    @Schema(description = "Descripción corta del estado HTTP", example = "Not Found")
    private final String error;

    @Schema(description = "Mensaje descriptivo del error", example = "Producto con id 99 no encontrado")
    private final String message;

    @Schema(description = "Ruta de la petición que originó el error", example = "/api/v1/products/99")
    private final String path;

    @Schema(description = "Detalle de validaciones fallidas por campo (solo en errores 400)")
    private final List<String> details;
}
