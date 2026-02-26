package com.araplac.almoxarifado_araplac.products.service.imp;

import com.araplac.almoxarifado_araplac.category.model.Category;
import com.araplac.almoxarifado_araplac.category.repository.CategoryRepository;
import com.araplac.almoxarifado_araplac.dto.Response;
import com.araplac.almoxarifado_araplac.exception.NotFoundException;
import com.araplac.almoxarifado_araplac.products.dto.ProductDTO;
import com.araplac.almoxarifado_araplac.products.model.Product;
import com.araplac.almoxarifado_araplac.products.repository.ProductRepository;
import com.araplac.almoxarifado_araplac.products.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImp implements ProductService {

    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;
    private final CategoryRepository categoryRepository;

    @Override
    public Response saveProduct(ProductDTO productDTO) {
        Category category = categoryRepository.findById(productDTO.getCategoryId()).orElseThrow(() -> new NotFoundException("Category not found."));

        Product productToSave = Product.builder()
                .name(productDTO.getName())
                .sku(productDTO.getSku())
                .stockQuantity(productDTO.getStockQuantity())
                .description(productDTO.getDescription())
                .category(category)
                .build();

        productRepository.save(productToSave);

        return Response.builder()
                .status(200)
                .message("Product successfully saved")
                .build();
    }

    @Override
    public Response updateProduct(ProductDTO productDTO) {
        Product existingProduct = productRepository.findById(productDTO.getProductId()).orElseThrow(() -> new NotFoundException("Product not found"));

        if (productDTO.getCategoryId() != null && productDTO.getCategoryId() > 0) {
            Category category = categoryRepository.findById(productDTO.getCategoryId()).orElseThrow(() -> new NotFoundException("Category not found"));
            existingProduct.setCategory(category);
        }

        if (productDTO.getName() != null && !productDTO.getName().isBlank()) {
            existingProduct.setName(productDTO.getName());
        }

        if (productDTO.getSku() != null && !productDTO.getSku().isBlank()) {
            existingProduct.setSku(productDTO.getSku());
        }

        if (productDTO.getDescription() != null && !productDTO.getDescription().isBlank()) {
            existingProduct.setDescription(productDTO.getDescription());
        }

        if (productDTO.getStockQuantity() != null && productDTO.getStockQuantity() >= 0) {
            existingProduct.setStockQuantity(productDTO.getStockQuantity());
        }

        productRepository.save(existingProduct);

        return Response.builder()
                .status(200)
                .message("Product updated successfully")
                .build();
    }

    @Override
    public Response getAllProducts() {
        List<Product> products = productRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        List<ProductDTO> productDTOList = modelMapper.map(products, new TypeToken<List<ProductDTO>>(){}.getType());

        return Response.builder()
                .status(200)
                .message("success")
                .products(productDTOList)
                .build();
    }

    @Override
    public Response getProductById(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product not found"));

        return Response.builder()
                .status(200)
                .message("success")
                .product(modelMapper.map(product, ProductDTO.class))
                .build();
    }

    @Override
    public Response deleteProduct(Long id) {
        productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product not found"));
        productRepository.deleteById(id);

        return Response.builder()
                .status(200)
                .message("Product deleted successfully")
                .build();
    }

    @Override
    public Response searchProduct(String input) {
        List<Product> products = productRepository.findByNameContainingOrDescriptionContaining(input, input);

        if (products.isEmpty()) {
            throw new NotFoundException("Product not found");
        }

        List<ProductDTO> productDTOList = modelMapper.map(products, new TypeToken<List<ProductDTO>>(){}.getType());

        return Response.builder()
                .status(200)
                .message("success")
                .products(productDTOList)
                .build();
    }
}
