package com.gamevault.api.service;

import com.gamevault.api.model.Usuario;
import com.gamevault.api.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario registrar(
            String nombre,
            String correo,
            String password) {

        String correoNormalizado = correo.trim().toLowerCase();

        if (usuarioRepository.existsByCorreo(correoNormalizado)) {
            throw new IllegalArgumentException(
                "El correo ya está registrado"
            );
        }

        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException(
                "La contraseña debe tener al menos 8 caracteres"
            );
        }

        Usuario usuario = new Usuario(
            nombre,
            correoNormalizado,
            passwordEncoder.encode(password)
        );

        return usuarioRepository.save(usuario);
    }
}
