const API_BASE_URL = 'http://localhost:8091/api/products';
const ITEMS_PER_PAGE = 10;

let productModal;
let deleteModal;
let productToDelete = null;

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let totalPages = 1;
let isSearching = false;
let searchTimeout;

document.addEventListener('DOMContentLoaded', function () {
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    loadProducts();
    
    // Adicionar evento de input com debounce
    document.getElementById('searchInput').addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(searchProducts, 500);
    });
});

async function loadProducts() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/all`);
        const data = await response.json();

        if (data.products) {
            allProducts = data.products;
            filteredProducts = [...allProducts];
            isSearching = false;
            currentPage = 1;
            updatePagination();
            renderCurrentPage();
            updateSearchInfo('');
        }
    } catch (error) {
        showError('Erro ao carregar produtos');
    } finally {
        hideLoading();
    }
}

async function searchProducts() {
    const input = document.getElementById('searchInput').value.trim();
    
    if (!input) {
        // Se busca vazia, volta para lista completa
        filteredProducts = [...allProducts];
        isSearching = false;
        currentPage = 1;
        updatePagination();
        renderCurrentPage();
        updateSearchInfo('');
        return;
    }

    try {
        showSearchLoading();
        const response = await fetch(`${API_BASE_URL}/search?input=${encodeURIComponent(input)}`);
        const data = await response.json();

        if (data.products) {
            filteredProducts = data.products;
            isSearching = true;
            currentPage = 1;
            updatePagination();
            renderCurrentPage();
            updateSearchInfo(`Encontrados ${filteredProducts.length} resultados para "${input}"`);
        } else {
            // Se não encontrar produtos
            filteredProducts = [];
            isSearching = true;
            currentPage = 1;
            updatePagination();
            renderCurrentPage();
            updateSearchInfo(`Nenhum resultado encontrado para "${input}"`);
        }
    } catch (error) {
        if (error.message.includes('404')) {
            // Produto não encontrado (404)
            filteredProducts = [];
            isSearching = true;
            currentPage = 1;
            updatePagination();
            renderCurrentPage();
            updateSearchInfo(`Nenhum resultado encontrado para "${input}"`);
        } else {
            showError('Erro ao buscar produtos');
        }
    } finally {
        hideSearchLoading();
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    filteredProducts = [...allProducts];
    isSearching = false;
    currentPage = 1;
    updatePagination();
    renderCurrentPage();
    updateSearchInfo('');
}

function updateSearchInfo(message) {
    document.getElementById('searchResultInfo').textContent = message;
}

function showSearchLoading() {
    const searchInfo = document.getElementById('searchInfo');
    const loading = document.createElement('span');
    loading.className = 'search-loading';
    loading.id = 'searchLoading';
    searchInfo.appendChild(loading);
}

function hideSearchLoading() {
    const loading = document.getElementById('searchLoading');
    if (loading) loading.remove();
}

function showLoading() {
    // Implementar se necessário
}

function hideLoading() {
    // Implementar se necessário
}

function updatePagination() {
    totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    renderPagination();
}

function renderCurrentPage() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    renderTable(filteredProducts.slice(start, end));
    updatePaginationInfo(start, end);
}

function renderTable(products) {
    const tbody = document.getElementById('productTable');

    if (!products.length) {
        tbody.innerHTML = `<tr>
            <td colspan="6" class="text-center py-5 text-muted">
                ${isSearching ? 'Nenhum produto encontrado para esta busca' : 'Nenhum produto cadastrado'}
            </td>
        </tr>`;
        return;
    }

    tbody.innerHTML = products.map(p => `
        <tr>
            <td><span class="badge-id">#${p.productId}</span></td>
            <td class="fw-semibold">${escapeHtml(p.name)}</td>
            <td>${escapeHtml(p.sku)}</td>
            <td>${p.stockQuantity}</td>
            <td>${escapeHtml(p.categoryName || p.categoryId)}</td>
            <td class="text-end">
                <button class="btn btn-action btn-action-edit me-1" onclick="editProduct(${p.productId})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-action btn-action-delete" onclick="openDeleteModal(${p.productId}, '${escapeHtml(p.name)}', '${escapeHtml(p.sku)}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    
    if (filteredProducts.length === 0) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';

    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">«</a>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>
        `;
    }

    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">»</a>
        </li>
    `;

    pagination.innerHTML = html;
}

function updatePaginationInfo(start, end) {
    const info = document.getElementById('paginationInfo');
    if (filteredProducts.length === 0) {
        info.textContent = '';
    } else {
        info.textContent = `Mostrando ${start + 1}-${Math.min(end, filteredProducts.length)} de ${filteredProducts.length} produtos`;
    }
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderCurrentPage();
    renderPagination();
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = "Novo Produto";
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    
    // Remover classes de erro e mensagens
    document.querySelectorAll('.form-control').forEach(el => {
        el.classList.remove('is-invalid');
    });
    document.querySelectorAll('.invalid-feedback').forEach(el => {
        el.textContent = '';
    });
    
    productModal.show();
}

async function editProduct(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const data = await response.json();

        if (data.product) {
            const p = data.product;
            document.getElementById('modalTitle').textContent = "Editar Produto";
            document.getElementById('productId').value = p.productId;
            document.getElementById('name').value = p.name || '';
            document.getElementById('sku').value = p.sku || '';
            document.getElementById('stockQuantity').value = p.stockQuantity || 0;
            document.getElementById('categoryId').value = p.categoryId || '';
            document.getElementById('description').value = p.description || '';
            
            // Remover classes de erro e mensagens
            document.querySelectorAll('.form-control').forEach(el => {
                el.classList.remove('is-invalid');
            });
            document.querySelectorAll('.invalid-feedback').forEach(el => {
                el.textContent = '';
            });
            
            productModal.show();
        }
    } catch (error) {
        showError('Erro ao carregar produto');
    }
}

function validateForm() {
    let isValid = true;
    
    document.querySelectorAll('.form-control').forEach(el => {
        el.classList.remove('is-invalid');
    });
    document.querySelectorAll('.invalid-feedback').forEach(el => {
        el.textContent = '';
    });
    
    const name = document.getElementById('name');
    if (!name.value.trim()) {
        name.classList.add('is-invalid');
        document.getElementById('nameError').textContent = 'Nome é obrigatório';
        isValid = false;
    }
    
    const sku = document.getElementById('sku');
    if (!sku.value.trim()) {
        sku.classList.add('is-invalid');
        document.getElementById('skuError').textContent = 'SKU é obrigatório';
        isValid = false;
    }
    
    const stock = document.getElementById('stockQuantity');
    if (stock.value === '' || stock.value < 0) {
        stock.classList.add('is-invalid');
        document.getElementById('stockError').textContent = 'Quantidade é obrigatória';
        isValid = false;
    }
    
    const category = document.getElementById('categoryId');
    if (category.value === '' || category.value < 1) {
        category.classList.add('is-invalid');
        document.getElementById('categoryError').textContent = 'ID da categoria é obrigatório';
        isValid = false;
    }
    
    return isValid;
}

async function saveProduct() {
    if (!validateForm()) {
        showError('Preencha todos os campos obrigatórios');
        return;
    }

    const formData = new FormData();
    const id = document.getElementById('productId').value;

    formData.append("name", document.getElementById('name').value.trim());
    formData.append("sku", document.getElementById('sku').value.trim());
    formData.append("stockQuantity", document.getElementById('stockQuantity').value);
    formData.append("categoryId", document.getElementById('categoryId').value);
    formData.append("description", document.getElementById('description').value.trim() || '');

    let url = id ? `${API_BASE_URL}/update?productId=${id}` : `${API_BASE_URL}/save`;
    let method = id ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            body: formData
        });

        if (response.ok) {
            productModal.hide();
            await loadProducts();
            showSuccess(id ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
        } else {
            showError('Erro ao salvar produto');
        }
    } catch (error) {
        showError('Erro ao conectar com o servidor');
    }
}

function openDeleteModal(id, name, sku) {
    productToDelete = id;
    document.getElementById('deleteProductName').textContent = name;
    document.getElementById('deleteProductSku').textContent = sku;
    deleteModal.show();
}

async function confirmDelete() {
    try {
        const response = await fetch(`${API_BASE_URL}/delete/${productToDelete}`, { 
            method: "DELETE" 
        });
        
        if (response.ok) {
            deleteModal.hide();
            await loadProducts();
            clearSearch();
            showSuccess('Produto excluído com sucesso!');
        } else {
            showError('Erro ao excluir produto');
        }
    } catch (error) {
        showError('Erro ao conectar com o servidor');
    }
}

function showError(msg) {
    const container = document.getElementById('alertContainer');
    container.innerHTML = `
        <div class="alert alert-danger alert-toast">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            ${msg}
        </div>
    `;
    setTimeout(() => container.innerHTML = '', 3000);
}

function showSuccess(message) {
    const container = document.getElementById('alertContainer');
    container.innerHTML = `
        <div class="alert alert-success alert-toast">
            <i class="bi bi-check-circle-fill me-2"></i>
            ${message}
        </div>
    `;
    setTimeout(() => container.innerHTML = '', 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}