package com.ejemplo.productos.service.impl;

import com.ejemplo.productos.entity.Product;
import com.ejemplo.productos.exception.ResourceNotFoundException;
import com.ejemplo.productos.repository.ProductRepository;
import com.ejemplo.productos.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementación de la lógica de negocio de productos.
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final String RECURSO = "Producto";

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Product> listarTodos() {
        return productRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Product obtenerPorId(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RECURSO, id));
    }

    @Override
    @Transactional
    public Product crear(Product producto) {
        producto.setId(null); // garantiza que siempre se inserte un registro nuevo
        return productRepository.save(producto);
    }

    @Override
    @Transactional
    public Product actualizar(Long id, Product datos) {
        Product existente = obtenerPorId(id);
        existente.setName(datos.getName());
        existente.setDescription(datos.getDescription());
        existente.setPrice(datos.getPrice());
        existente.setStock(datos.getStock());
        return productRepository.save(existente);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Product existente = obtenerPorId(id);
        productRepository.delete(existente);
    }
}
