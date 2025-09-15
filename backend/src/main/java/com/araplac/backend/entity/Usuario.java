package com.araplac.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "login")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario", nullable = false, unique = true, length = 150)
    private String usuario;

    @Column(name = "senha", nullable = false, length = 60)
    private String senha;

    @Column(name = "esta_ativo", nullable = false)
    private boolean estaAtivo = true;
}
