package com.araplac.almoxarifado_araplac.category.serivce;

import com.araplac.almoxarifado_araplac.category.dto.CategoryDTO;
import com.araplac.almoxarifado_araplac.dto.Response;

public interface CategoryService {

     Response createCategory(CategoryDTO categoryDTO);

     Response getAllCategories();

     Response getCategoryById(Long id);

     Response updateCategory(Long id, CategoryDTO categoryDTO);

     Response deleteCategory(Long id);
}
