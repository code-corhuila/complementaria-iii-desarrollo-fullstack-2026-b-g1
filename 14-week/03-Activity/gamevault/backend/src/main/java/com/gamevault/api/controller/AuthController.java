package com.gamevault.api.controller;

import com.gamevault.api.model.Usuario;
import com.gamevault.api.repository.UsuarioRepository;
import com.gamevault.api.service.JwtService;
import com.gamevault.api.service.UsuarioService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UsuarioService usuarioService,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public record RegistroRequest(
        @NotBlank String nombre,
        @NotBlank @Email String correo,
        @NotBlank @Size(min = 8) String password
    ) {}

    public record LoginRequest(
        @NotBlank @Email String correo,
        @NotBlank String password
    ) {}

    @PostMapping("/register")
    public ResponseEntity<?> registrar(
            @Valid @RequestBody RegistroRequest request) {

        try {
            Usuario usuario = usuarioService.registrar(
                request.nombre(),
                request.correo(),
                request.password()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "mensaje", "Usuario registrado correctamente",
                    "id", usuario.getId(),
                    "nombre", usuario.getNombre(),
                    "correo", usuario.getCorreo()
                )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request) {

        String correo = request.correo().trim().toLowerCase();

        var usuarioOptional = usuarioRepository.findByCorreo(correo);

        if (usuarioOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                    "error", "Correo o contraseña incorrectos"
                ));
        }

        Usuario usuario = usuarioOptional.get();

        if (!passwordEncoder.matches(
                request.password(), usuario.getPassword())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                    "error", "Correo o contraseña incorrectos"
                ));
        }

        String token = jwtService.generarToken(usuario);

        return ResponseEntity.ok(Map.of(
            "token", token,
            "tipo", "Bearer",
            "usuario", Map.of(
                "id", usuario.getId(),
                "nombre", usuario.getNombre(),
                "correo", usuario.getCorreo()
            )
        ));
    }
}
