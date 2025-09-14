package com.araplac.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.araplac.backend.entity.Item;
import com.araplac.backend.repository.ItemRepository;

@Service
public class ItemService {
    
    @Autowired
    private ItemRepository itemRepository;

    public Item addItem(Item item) {
        return itemRepository.save(item);
    }

    public List<Item> mostrarItens() {
        return itemRepository.findAll();
    }

    public List<Item> addVariosItens(List<Item> itens) {
        return itemRepository.saveAll(itens);
    }

    public boolean removerItem(Long id) {
        if (itemRepository.existsById(id)) {
            itemRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
