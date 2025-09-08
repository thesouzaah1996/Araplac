package com.kitsparana.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Data
public class Produto {

    @Id
    @Column(name = "id", columnDefinition = "BINARY(16)", updatable = false, nullable = false)
    private Long id;

    private String codigo;

    private String name;

    private String unidade;

    private int quantidade;

    private String localPrateleira;

    private String fornecedor;
}
