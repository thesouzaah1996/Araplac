package com.araplac.almoxarifado_araplac.products.controller;

import com.araplac.almoxarifado_araplac.dto.Response;
import com.araplac.almoxarifado_araplac.products.dto.ProductDTO;
import com.araplac.almoxarifado_araplac.products.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/almoxarifado/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping("/save")
//    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> saveProduct(
            @RequestParam("name") String name,
            @RequestParam("sku") String sku,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "description", required = false) String description
    ) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setName(name);
        productDTO.setSku(sku);
        productDTO.setStockQuantity(stockQuantity);
        productDTO.setCategoryId(categoryId);
        productDTO.setDescription(description);

        return ResponseEntity.ok(productService.saveProduct(productDTO));
    }

    @PutMapping("/update")
//    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> updateProduct(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "sku", required = false) String sku,
            @RequestParam(value = "price", required = false) BigDecimal price,
            @RequestParam(value = "stockQuantity", required = false) Integer stockQuantity,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("productId") Long productId
    ) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setName(name);
        productDTO.setSku(sku);
        productDTO.setProductId(productId);
        productDTO.setStockQuantity(stockQuantity);
        productDTO.setCategoryId(categoryId);
        productDTO.setDescription(description);

        return ResponseEntity.ok(productService.updateProduct(productDTO));
    }

    @GetMapping("/all")
    public ResponseEntity<Response> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @DeleteMapping("/delete/{id}")
//    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.deleteProduct(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Response> searchProduct(@RequestParam String input) {
        return ResponseEntity.ok(productService.searchProduct(input));
    }
}