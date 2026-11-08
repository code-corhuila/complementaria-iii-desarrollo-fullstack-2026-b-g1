package com.gamevault.api.repository;

import com.gamevault.api.model.Videojuego;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VideojuegoRepository extends JpaRepository<Videojuego, Long> {

    List<Videojuego> findByUsuarioId(Long usuarioId);
}
