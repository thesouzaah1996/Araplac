package com.kitsparana.backend;

import com.kitsparana.backend.entity.Produto;
import com.kitsparana.backend.infra.BusinessException;
import com.kitsparana.backend.infra.NotFoundException;
import com.kitsparana.backend.repository.ProdutoRepository;
import com.kitsparana.backend.service.ProdutoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ProdutoServiceTest {

    private ProdutoRepository repository;
    private ProdutoService service;

    @BeforeEach
    void setUp() {
        repository = mock(ProdutoRepository.class);

        service = new ProdutoService() {
            @Override
            public Produto create(Produto novo) {
                if (novo.getCodigo() == null || novo.getCodigo().isBlank()) {
                    throw new BusinessException("código é obrigatório.");
                }
                if (repository.existsByCodigo(novo.getCodigo())) {
                    throw new BusinessException("código já cadastrado.");
                }
                return repository.save(novo);
            }

            @Override
            public Produto getById(Long id) {
                return repository.findById(id).orElseThrow(() -> new NotFoundException("Produto de id: " + id + " não encontrado."));
            }

            @Override
            public Produto update(Long id, Produto changes) {
                Produto atual = getById(id);
                if (changes.getCodigo() != null && !changes.getCodigo().equals(atual.getCodigo())) {
                    if (repository.existsByCodigo(changes.getCodigo()))
                        throw new BusinessException("codigo já cadastrado");
                    atual.setCodigo(changes.getCodigo());
                }
                if (changes.getName() != null) atual.setName(changes.getName());
                if (changes.getUnidade() != null) atual.setUnidade(changes.getUnidade());
                if (changes.getQuantidade() != 0) atual.setQuantidade(changes.getQuantidade());
                if (changes.getLocalPrateleira() != null) atual.setLocalPrateleira(changes.getLocalPrateleira());
                if (changes.getFornecedor() != null) atual.setFornecedor(changes.getFornecedor());
                return repository.save(atual);
            }

            @Override
            public void delete(Long id) {
                Produto atual = getById(id);
                repository.delete(atual);
            }

            @Override
            public Page<Produto> list(org.springframework.data.domain.Pageable pageable) {
                return repository.findAll(pageable);
            }
        };
    }

    private Produto novoProduto(String codigo) {
        Produto produto = new Produto();
        produto.setCodigo(codigo);
        produto.setName("Maquita");
        produto.setUnidade("Caixa");
        produto.setQuantidade(100);
        produto.setLocalPrateleira("A1");
        produto.setFornecedor("ACME");
        return produto;
    }

    @Test
    @DisplayName("create: persiste quando o código for único")
    void create_ok() {
        Produto novo = novoProduto("P-001");
        when(repository.existsByCodigo("P-001")).thenReturn(false);
        when(repository.save(any(Produto.class))).thenAnswer(inv -> {
            Produto saved = inv.getArgument(0);
            saved.setId(1L);
            return saved;
        });
    }
}
