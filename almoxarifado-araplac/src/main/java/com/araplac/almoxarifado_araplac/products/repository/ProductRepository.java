package com.araplac.almoxarifado_araplac.products.repository;

import com.araplac.almoxarifado_araplac.products.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingOrDescriptionContaining(String name, String description);
    Long id(Long id);
}
