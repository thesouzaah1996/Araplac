const API_BASE_URL = 'http://localhost:8091/api/categories';
const ITEMS_PER_PAGE = 10;

let categoryModal;
let deleteModal;
let categoryToDelete = null;

let allCategories = [];
let currentPage = 1;
let totalPages = 1;

document.addEventListener('DOMContentLoaded', function () {

    categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));

    loadCategories();
});

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/all`);
        const data = await response.json();

        if (data.categories && Array.isArray(data.categories)) {
            allCategories = data.categories;
            totalPages = Math.ceil(allCategories.length / ITEMS_PER_PAGE);
            renderCurrentPage();
            renderPagination();
        } else {
            showError('Nenhuma categoria encontrada');
        }

    } catch (error) {
        showError('Erro ao carregar categorias');
    }
}

function renderCurrentPage() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, allCategories.length);
    renderCategoryTable(allCategories.slice(startIndex, endIndex));
    updatePaginationInfo(startIndex, endIndex);
}

function renderCategoryTable(categories) {
    const tbody = document.getElementById('categoryTable');

    if (!categories.length) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center">Nenhuma categoria cadastrada</td></tr>`;
        return;
    }

    tbody.innerHTML = categories.map(category => `
        <tr>
            <td><span class="badge-id">#${category.id}</span></td>
            <td class="fw-semibold">${escapeHtml(category.name)}</td>
            <td class="text-end">
                <button class="btn btn-action btn-action-edit me-1" onclick="editCategory(${category.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-action btn-action-delete" onclick="openDeleteModal(${category.id}, '${escapeHtml(category.name)}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
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
    document.getElementById('paginationInfo').textContent =
        `Mostrando ${start + 1}-${end} de ${allCategories.length} categorias`;
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderCurrentPage();
    renderPagination();
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Nova Categoria';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    categoryModal.show();
}

async function editCategory(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    const data = await response.json();

    if (data.category) {
        document.getElementById('modalTitle').textContent = 'Editar Categoria';
        document.getElementById('categoryId').value = data.category.id;
        document.getElementById('name').value = data.category.name;
        categoryModal.show();
    }
}

async function saveCategory() {
    const name = document.getElementById('name').value.trim();
    const id = document.getElementById('categoryId').value;

    if (!name) return alert('Preencha o nome');

    const payload = { name };

    const url = id ? `${API_BASE_URL}/update/${id}` : `${API_BASE_URL}/add`;
    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        categoryModal.hide();
        loadCategories();
        showSuccess(id ? 'Categoria atualizada!' : 'Categoria criada!');
    }
}

function openDeleteModal(id, name) {
    categoryToDelete = id;
    document.getElementById('deleteCategoryName').textContent = name;
    deleteModal.show();
}

async function confirmDelete() {
    await fetch(`${API_BASE_URL}/delete/${categoryToDelete}`, { method: 'DELETE' });
    deleteModal.hide();
    loadCategories();
    showSuccess('Categoria excluída!');
}

function showError(msg) {
    document.getElementById('categoryTable').innerHTML =
        `<tr><td colspan="3" class="text-danger text-center">${msg}</td></tr>`;
}

function showSuccess(message) {
    const container = document.getElementById('alertContainer');
    container.innerHTML =
        `<div class="alert alert-success alert-toast">${message}</div>`;
    setTimeout(() => container.innerHTML = '', 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
