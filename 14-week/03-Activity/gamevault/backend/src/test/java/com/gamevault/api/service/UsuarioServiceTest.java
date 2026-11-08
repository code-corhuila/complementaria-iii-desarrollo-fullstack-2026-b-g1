package com.gamevault.api.service;

import com.gamevault.api.model.Usuario;
import com.gamevault.api.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UsuarioServiceTest {

    @Test
    void registraUsuarioConPasswordCifrada() {
        UsuarioRepository repo = mock(UsuarioRepository.class);
        var encoder = new BCryptPasswordEncoder();
        var servicio = new UsuarioService(repo, encoder);

        when(repo.save(any(Usuario.class)))
            .thenAnswer(inv -> inv.getArgument(0));

        Usuario usuario = servicio.registrar(
            "Juan", "JUAN@EXAMPLE.COM", "Password123!"
        );

        assertEquals("juan@example.com", usuario.getCorreo());
        assertNotEquals("Password123!", usuario.getPassword());
        assertTrue(encoder.matches(
            "Password123!", usuario.getPassword()
        ));
        verify(repo).save(any(Usuario.class));
    }

    @Test
    void rechazaCorreoDuplicado() {
        UsuarioRepository repo = mock(UsuarioRepository.class);
        var servicio = new UsuarioService(
            repo, new BCryptPasswordEncoder()
        );

        when(repo.existsByCorreo("juan@example.com"))
            .thenReturn(true);

        var error = assertThrows(
            IllegalArgumentException.class,
            () -> servicio.registrar(
                "Juan", "juan@example.com", "Password123!"
            )
        );

        assertEquals(
            "El correo ya está registrado", error.getMessage()
        );
        verify(repo, never()).save(any(Usuario.class));
    }
}
