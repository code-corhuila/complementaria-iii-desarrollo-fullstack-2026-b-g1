package com.gamevault.api.controller;

import com.gamevault.api.model.Usuario;
import com.gamevault.api.model.Videojuego;
import com.gamevault.api.repository.UsuarioRepository;
import com.gamevault.api.repository.VideojuegoRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/videojuegos")
public class VideojuegoController {

    private final VideojuegoRepository videojuegoRepository;
    private final UsuarioRepository usuarioRepository;

    public VideojuegoController(
            VideojuegoRepository videojuegoRepository,
            UsuarioRepository usuarioRepository) {
        this.videojuegoRepository = videojuegoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public record VideojuegoRequest(
        @NotBlank String titulo,
        @NotBlank String genero,
        @NotBlank String estado,
        @NotNull @Min(0) @Max(100) Integer progreso
    ) {}

    public record VideojuegoResponse(
        Long id,
        String titulo,
        String genero,
        String estado,
        Integer progreso
    ) {}

    private VideojuegoResponse convertir(Videojuego juego) {
        return new VideojuegoResponse(
            juego.getId(),
            juego.getTitulo(),
            juego.getGenero(),
            juego.getEstado(),
            juego.getProgreso()
        );
    }

    @GetMapping
    public ResponseEntity<List<VideojuegoResponse>> listar(
            @AuthenticationPrincipal Jwt jwt) {

        Usuario usuario = usuarioRepository
            .findByCorreo(jwt.getSubject())
            .orElseThrow();

        List<VideojuegoResponse> juegos = videojuegoRepository
            .findByUsuarioId(usuario.getId())
            .stream()
            .map(this::convertir)
            .toList();

        return ResponseEntity.ok(juegos);
    }

    @PostMapping
    public ResponseEntity<VideojuegoResponse> crear(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody VideojuegoRequest request) {

        Usuario usuario = usuarioRepository
            .findByCorreo(jwt.getSubject())
            .orElseThrow();

        Videojuego juego = new Videojuego(
            request.titulo(),
            request.genero(),
            request.estado(),
            request.progreso(),
            usuario
        );

        Videojuego guardado = videojuegoRepository.save(juego);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(convertir(guardado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {

        Usuario usuario = usuarioRepository
            .findByCorreo(jwt.getSubject())
            .orElseThrow();

        var juego = videojuegoRepository.findById(id);

        if (juego.isEmpty() ||
            !juego.get().getUsuario().getId().equals(usuario.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Videojuego no encontrado"));
        }

        videojuegoRepository.delete(juego.get());

        return ResponseEntity.noContent().build();
    }
}
