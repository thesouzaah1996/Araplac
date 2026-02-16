package com.araplac.almoxarifado_araplac.dto;

import com.araplac.almoxarifado_araplac.supplier.dto.SupplierDTO;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {

    private int status;

    private String message;

    private String token;

    private SupplierDTO supplier;
//
    private List<SupplierDTO> suppliers;
//
//    private CategoryDTO category;
//
//    private List<CategoryDTO> categories;
//
//    private ProductDTO product;
//
//    private List<ProductDTO> products;

//    private TransactionDTO transaction;
//
//    private List<TransactionDTO> transactions;

    private final LocalDateTime timestamp = LocalDateTime.now();
}
