package com.kitsparana.backend.service;

import com.kitsparana.backend.entity.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ProdutoService {
    Produto create(Produto novo);
    Produto getById(Long id);
    Produto update(Long id, Produto changes);
    void delete(Long id);
    Page<Produto> list(Pageable pageable);
}
