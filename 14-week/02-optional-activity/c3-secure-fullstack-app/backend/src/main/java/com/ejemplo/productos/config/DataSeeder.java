package com.ejemplo.productos.config;

import com.ejemplo.productos.entity.Product;
import com.ejemplo.productos.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Carga productos de ejemplo para que la vista protegida del frontend muestre datos.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    public DataSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return;
        }
        productRepository.saveAll(List.of(
                new Product(null, "Teclado mecánico", "Switches rojos, retroiluminado", 249900.0, 25),
                new Product(null, "Mouse inalámbrico", "Sensor óptico 1600 DPI", 89900.0, 40),
                new Product(null, "Monitor 24\"", "Full HD IPS 75 Hz", 689000.0, 8)));
    }
}
