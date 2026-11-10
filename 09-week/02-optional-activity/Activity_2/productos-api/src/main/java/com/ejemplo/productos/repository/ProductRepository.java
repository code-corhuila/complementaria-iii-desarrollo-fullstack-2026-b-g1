package com.ejemplo.productos.repository;

import com.ejemplo.productos.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de acceso a datos para la entidad {@link Product}.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
}
