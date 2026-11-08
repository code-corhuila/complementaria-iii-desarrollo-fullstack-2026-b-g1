package com.gamevault.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "videojuegos")
public class Videojuego {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String titulo;

    @NotBlank
    @Column(nullable = false)
    private String genero;

    @NotBlank
    @Column(nullable = false)
    private String estado;

    @NotNull
    @Min(0)
    @Max(100)
    @Column(nullable = false)
    private Integer progreso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    public Videojuego() {
    }

    public Videojuego(String titulo, String genero,
                      String estado, Integer progreso,
                      Usuario usuario) {
        this.titulo = titulo;
        this.genero = genero;
        this.estado = estado;
        this.progreso = progreso;
        this.usuario = usuario;
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getProgreso() {
        return progreso;
    }

    public void setProgreso(Integer progreso) {
        this.progreso = progreso;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
