package com.araplac.almoxarifado_araplac.category.repository;

import com.araplac.almoxarifado_araplac.category.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
