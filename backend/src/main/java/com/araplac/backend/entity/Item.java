package com.araplac.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Item {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigoProduto;

    private String descricao;

    private Categoria categoria;

    private String unidade;

    private int quantidade;

    private String localizacaoPrateleira;

    private LocalDateTime data;

    private String responsávelRecebimento;
}
