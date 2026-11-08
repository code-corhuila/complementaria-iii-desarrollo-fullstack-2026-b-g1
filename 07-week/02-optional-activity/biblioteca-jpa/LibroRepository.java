package com.example.biblioteca;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LibroRepository extends JpaRepository<Libro, Long> {

    List<Libro> findByAutorIgnoreCase(String autor);
}