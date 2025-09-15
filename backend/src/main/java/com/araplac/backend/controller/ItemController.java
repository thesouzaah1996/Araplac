package com.araplac.backend.controller;

import com.araplac.backend.entity.Item;
import com.araplac.backend.service.ItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/itens")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping("/salvar")
    public ResponseEntity<Item> salvarItem(@RequestBody Item item) {
        Item novoItem = itemService.addItem(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoItem);
    }

    @GetMapping
    public ResponseEntity<List<Item>> listarItens() {
        List<Item> itens = itemService.mostrarItens();
        return ResponseEntity.ok(itens);
    }

    @GetMapping("/codigo/{codigoProduto}")
    public ResponseEntity<Item> buscarPorCodigo(@PathVariable String codigoProduto) {
        Optional<Item> itemOpt = itemService.buscarPorCodigo(codigoProduto);
        return itemOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/salvar-varios-itens")
    public ResponseEntity<List<Item>> salvarVariosItens(@RequestBody List<Item> itenList) {
        List<Item> itens = itemService.addVariosItens(itenList);
        return ResponseEntity.status(HttpStatus.CREATED).body(itens);
    }

    @PutMapping("/editar/{id}")
    public ResponseEntity<Item> editarItem(@PathVariable Long id, @RequestBody Item itemAtualizado) {
        Item itemEditado = itemService.editarItem(id, itemAtualizado);
        return ResponseEntity.ok(itemEditado);
    }

    @DeleteMapping("/remover/{id}")
    public ResponseEntity<Void> removerItem(@PathVariable Long id) {
        boolean removido = itemService.removerItem(id);
        if (removido) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }
}
