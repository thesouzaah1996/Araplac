package com.araplac.backend.service;

import java.util.List;
import java.util.Optional;

import javax.naming.NameNotFoundException;

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

    public Item editarItem(Long id, Item itemAtualizado) {
        Optional<Item> itemExistenteOpt = itemRepository.findById(id);

        if (itemExistenteOpt.isEmpty()) {
            throw new IllegalArgumentException("Item com id: " + id + " não encontrado");
        }

        Item itemExistente = itemExistenteOpt.get();

        itemExistente.setCodigoProduto(itemAtualizado.getCodigoProduto());
        itemExistente.setDescricao(itemAtualizado.getDescricao());
        itemExistente.setCategoria(itemAtualizado.getCategoria());
        itemExistente.setUnidade(itemAtualizado.getUnidade());
        itemExistente.setQuantidade(itemAtualizado.getQuantidade());
        itemExistente.setLocalizacaoPrateleira(itemAtualizado.getLocalizacaoPrateleira());
        itemExistente.setData(itemAtualizado.getData());
        itemExistente.setResponsávelRecebimento(itemAtualizado.getResponsávelRecebimento());

        return itemRepository.save(itemExistente);
    }

    public Optional<Item> buscarPorCodigo(String codigoProduto) {
        return itemRepository.findByCodigoProduto(codigoProduto);
    }
}
