package com.ejemplo.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.*;
import java.util.List;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}

// 1. ENTITY
@Entity
class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private Double precio;

    public Producto() {}
    public Producto(String nombre, Double precio) {
        this.nombre = nombre;
        this.precio = precio;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
}

// 2. REPOSITORY (JPA)
interface ProductoRepository extends JpaRepository<Producto, Long> {}

// 3. SERVICE
@Service
class ProductoService {
    @Autowired
    private ProductoRepository repository;

    public List<Producto> listarTodos() { return repository.findAll(); }
    public Producto obtenerPorId(Long id) { return repository.findById(id).orElse(null); }
    public Producto guardar(Producto p) { return repository.save(p); }
    public void eliminar(Long id) { repository.deleteById(id); }
}

// 4. CONTROLLER (CRUD Completo REST)
@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
class ProductoController {
    @Autowired
    private ProductoService service;

    @GetMapping
    public List<Producto> getAll() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getById(@PathVariable Long id) {
        Producto p = service.obtenerPorId(id);
        if (p == null) return ResponseEntity.notFound().build(); // Error 404
        return ResponseEntity.ok(p);
    }

    @PostMapping
    public ResponseEntity<Producto> create(@RequestBody Producto p) {
        if (p.getNombre() == null || p.getPrecio() == null) {
            return ResponseEntity.badRequest().build(); // Error 400
        }
        return ResponseEntity.status(201).body(service.guardar(p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> update(@PathVariable Long id, @RequestBody Producto p) {
        Producto existente = service.obtenerPorId(id);
        if (existente == null) return ResponseEntity.notFound().build(); // Error 404
        existente.setNombre(p.getNombre());
        existente.setPrecio(p.getPrecio());
        return ResponseEntity.ok(service.guardar(existente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.obtenerPorId(id) == null) return ResponseEntity.notFound().build(); // Error 404
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}