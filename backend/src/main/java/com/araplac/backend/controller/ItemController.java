package com.araplac.backend.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.araplac.backend.entity.Item;
import com.araplac.backend.service.ItemService;

@RestController
@RequestMapping("/api/itens")
public class ItemController {
    
    @Autowired
    private ItemService itemService;

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

    @PostMapping("/salvar-varios-itens")
    public ResponseEntity<List<Item>> salvarVariosItens(@RequestBody List<Item> itenList) {
        List<Item> itens = itemService.addVariosItens(itenList);
        return ResponseEntity.status(HttpStatus.CREATED).body(itens);
    }

    @DeleteMapping("/remover/{id}")
    public ResponseEntity<Void> removerItem(@PathVariable Long id) {
        boolean removido = itemService.removerItem(id);

        if (removido) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
