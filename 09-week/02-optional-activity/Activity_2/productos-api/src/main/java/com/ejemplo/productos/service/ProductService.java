package com.ejemplo.productos.service;

import com.ejemplo.productos.entity.Product;

import java.util.List;

/**
 * Contrato de la lógica de negocio para productos.
 */
public interface ProductService {

    List<Product> listarTodos();

    Product obtenerPorId(Long id);

    Product crear(Product producto);

    Product actualizar(Long id, Product producto);

    void eliminar(Long id);
}
