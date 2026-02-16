package com.araplac.almoxarifado_araplac.supplier.service;

import com.araplac.almoxarifado_araplac.dto.Response;
import com.araplac.almoxarifado_araplac.supplier.dto.SupplierDTO;

public interface SupplierService {

    Response addSupplier(SupplierDTO supplierDTO);

    Response updateSupplier(Long id, SupplierDTO supplierDTO);

    Response getAllSupplier();

    Response getSupplierById(Long id);

    Response deleteSupplier(Long id);
}
