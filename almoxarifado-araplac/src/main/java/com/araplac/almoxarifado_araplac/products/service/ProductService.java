package com.araplac.almoxarifado_araplac.products.service;

import com.araplac.almoxarifado_araplac.dto.Response;
import com.araplac.almoxarifado_araplac.products.dto.ProductDTO;
import org.springframework.web.multipart.MultipartFile;

public interface ProductService {

    Response saveProduct(ProductDTO productDTO);

    Response updateProduct(ProductDTO productDTO);

    Response getAllProducts();

    Response getProductById(Long id);

    Response deleteProduct(Long id);

    Response searchProduct(String input);
}
