package com.araplac.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.araplac.backend.entity.Item;
import com.araplac.backend.repository.ItemRepository;

@Service
public class ItemService {
    
    @Autowired
    private ItemRepository itemService;

    public Item addItem(Item item) {
        return itemService.save(item);
    }

    public List<Item> mostrarItens() {
        return itemService.findAll();
    }
}
