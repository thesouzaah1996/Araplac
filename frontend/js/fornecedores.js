const API_BASE_URL = 'http://localhost:8091/api';
const ITEMS_PER_PAGE = 10;

let supplierModal;
let deleteModal;
let supplierToDelete = null;

// Variáveis de paginação
let allSuppliers = [];
let currentPage = 1;
let totalPages = 1;

document.addEventListener('DOMContentLoaded', function() {
    if (typeof bootstrap !== 'undefined') {
        const modalElement = document.getElementById('supplierModal');
        if (modalElement) {
            supplierModal = new bootstrap.Modal(modalElement);
        }
        
        const deleteModalElement = document.getElementById('deleteConfirmModal');
        if (deleteModalElement) {
            deleteModal = new bootstrap.Modal(deleteModalElement);
        }
    }
    
    loadSuppliers();
    
    const contactInput = document.getElementById('contactInfo');
    if (contactInput) {
        contactInput.addEventListener('input', function(e) {
            const value = e.target.value;
            
            e.target.classList.remove('is-invalid');
            document.getElementById('contactError').textContent = '';
            
            if (!value.includes('@') && /^[\d\s\(\)\-]+$/.test(value.replace(/\D/g, ''))) {
                let numbers = value.replace(/\D/g, '');
                
                if (numbers.length > 0 && !/[a-zA-Z]/.test(value)) {
                    if (numbers.length > 11) numbers = numbers.slice(0, 11);
                    
                    if (numbers.length > 7) {
                        e.target.value = numbers.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                    } else if (numbers.length > 2) {
                        e.target.value = numbers.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                    } else if (numbers.length > 0) {
                        e.target.value = numbers.replace(/^(\d*)/, '($1');
                    }
                }
            }
        });
        
        contactInput.addEventListener('blur', function(e) {
            validateContact(e.target.value);
        });
    }
});

function validateContact(contact) {
    const contactInput = document.getElementById('contactInfo');
    const errorDiv = document.getElementById('contactError');
    
    if (!contact) return true;
    
    if (contact.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact)) {
            contactInput.classList.add('is-invalid');
            errorDiv.textContent = 'Digite um email válido (ex: nome@empresa.com)';
            return false;
        }
    } else {
        const numbers = contact.replace(/\D/g, '');
        if (numbers.length < 10 || numbers.length > 11) {
            contactInput.classList.add('is-invalid');
            errorDiv.textContent = 'Digite um telefone válido com DDD (10 ou 11 dígitos)';
            return false;
        }
    }
    
    contactInput.classList.remove('is-invalid');
    errorDiv.textContent = '';
    return true;
}

async function loadSuppliers() {
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers/all`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.suppliers && Array.isArray(data.suppliers)) {
            allSuppliers = data.suppliers;
            totalPages = Math.ceil(allSuppliers.length / ITEMS_PER_PAGE);
            renderCurrentPage();
            renderPagination();
        } else {
            showError('Nenhum fornecedor encontrado');
        }
    } catch (error) {
        showError('Erro ao carregar fornecedores');
    }
}

function renderCurrentPage() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, allSuppliers.length);
    const pageSuppliers = allSuppliers.slice(startIndex, endIndex);
    
    renderSupplierTable(pageSuppliers);
    updatePaginationInfo(startIndex, endIndex);
}

function renderSupplierTable(suppliers) {
    const tbody = document.getElementById('supplierTable');
    
    if (!suppliers || suppliers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5 text-muted">
                    <i class="bi bi-building fs-1 d-block mb-3 opacity-50"></i>
                    <h5 class="fw-normal">Nenhum fornecedor cadastrado</h5>
                    <p class="small mb-3">Clique em "Novo Fornecedor" para começar</p>
                    <button class="btn btn-danger btn-sm" onclick="openAddModal()">
                        <i class="bi bi-plus-circle me-2"></i>
                        Adicionar Fornecedor
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = suppliers.map(supplier => {
        const id = supplier.id;
        const name = supplier.name;
        const contactInfo = supplier.contactInfo || '—';
        const address = supplier.address || '—';
        
        const contactDisplay = contactInfo.includes('@') ? contactInfo : formatContact(contactInfo);
        
        return `
            <tr>
                <td><span class="badge-id">#${id}</span></td>
                <td class="fw-semibold">${escapeHtml(name)}</td>
                <td><span class="text-muted">${escapeHtml(address)}</span></td>
                <td>${escapeHtml(contactDisplay)}</td>
                <td class="text-end">
                    <button class="btn btn-action btn-action-edit me-1" onclick="editSupplier(${id})" title="Editar fornecedor">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-action btn-action-delete" onclick="openDeleteModal(${id}, '${escapeHtml(name)}')" title="Excluir fornecedor">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    let paginationHtml = '';
    
    // Botão Anterior
    paginationHtml += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Botões de página
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    // Botão Próximo
    paginationHtml += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `;
    
    pagination.innerHTML = paginationHtml;
}

function updatePaginationInfo(startIndex, endIndex) {
    const info = document.getElementById('paginationInfo');
    info.textContent = `Mostrando ${startIndex + 1}-${endIndex} de ${allSuppliers.length} fornecedores`;
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderCurrentPage();
    renderPagination();
}

function showError(message) {
    const tbody = document.getElementById('supplierTable');
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-4 text-danger">
                <i class="bi bi-exclamation-circle fs-3 d-block mb-2"></i>
                ${message}
            </td>
        </tr>
    `;
    
    // Esconde paginação em caso de erro
    document.getElementById('paginationContainer').style.display = 'none';
}

function showSuccess(message) {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alertHtml = `
        <div id="${alertId}" class="alert alert-success alert-dismissible fade show alert-toast" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHtml;
    
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.remove();
        }
    }, 3000);
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Novo Fornecedor';
    document.getElementById('supplierForm').reset();
    document.getElementById('supplierId').value = '';
    
    const contactInput = document.getElementById('contactInfo');
    contactInput.placeholder = "Telefone ou Email";
    contactInput.classList.remove('is-invalid');
    document.getElementById('contactError').textContent = '';
    
    supplierModal.show();
}

async function editSupplier(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.supplier && data.supplier.id) {
            const supplier = data.supplier;
            document.getElementById('modalTitle').textContent = 'Editar Fornecedor';
            document.getElementById('supplierId').value = supplier.id;
            document.getElementById('name').value = supplier.name || '';
            
            const contactInfo = supplier.contactInfo || '';
            if (contactInfo.includes('@')) {
                document.getElementById('contactInfo').value = contactInfo;
            } else {
                document.getElementById('contactInfo').value = formatContact(contactInfo);
            }
            
            document.getElementById('address').value = supplier.address || '';
            
            supplierModal.show();
        } else {
            showError('Erro ao carregar fornecedor');
        }
    } catch (error) {
        showError('Erro de conexão com o servidor');
    }
}

async function saveSupplier() {
    const name = document.getElementById('name').value.trim();
    const contactInfo = document.getElementById('contactInfo').value.trim();
    const address = document.getElementById('address').value.trim();
    
    const contactInput = document.getElementById('contactInfo');
    contactInput.classList.remove('is-invalid');
    document.getElementById('contactError').textContent = '';
    
    if (!name) {
        alert('Por favor, preencha o nome do fornecedor');
        document.getElementById('name').focus();
        return;
    }
    
    if (!contactInfo) {
        alert('Por favor, preencha o contato do fornecedor (telefone ou email)');
        document.getElementById('contactInfo').focus();
        return;
    }
    
    if (!validateContact(contactInfo)) {
        return;
    }
    
    if (!address) {
        alert('Por favor, preencha o endereço do fornecedor');
        document.getElementById('address').focus();
        return;
    }
    
    const supplierId = document.getElementById('supplierId').value;
    
    let processedContact = contactInfo;
    if (!contactInfo.includes('@')) {
        processedContact = contactInfo.replace(/\D/g, '');
    }
    
    const supplierData = {
        name: name,
        contactInfo: processedContact,
        address: address
    };
    
    try {
        let response;
        let url;
        let method;
        
        if (supplierId) {
            url = `${API_BASE_URL}/suppliers/update/${supplierId}`;
            method = 'PUT';
        } else {
            url = `${API_BASE_URL}/suppliers/add`;
            method = 'POST';
        }
        
        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(supplierData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            supplierModal.hide();
            await loadSuppliers();
            showSuccess(supplierId ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor adicionado com sucesso!');
        } else {
            alert('Erro ao salvar fornecedor: ' + (data.message || 'Erro desconhecido'));
        }
    } catch (error) {
        alert('Erro de conexão com o servidor');
    }
}

function openDeleteModal(id, name) {
    supplierToDelete = id;
    document.getElementById('deleteSupplierName').textContent = name;
    deleteModal.show();
}

function closeDeleteModal() {
    deleteModal.hide();
    supplierToDelete = null;
}

async function confirmDelete() {
    if (!supplierToDelete) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers/${supplierToDelete}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closeDeleteModal();
            await loadSuppliers();
            showSuccess('Fornecedor excluído com sucesso!');
        } else {
            alert('Erro ao excluir fornecedor: ' + (data.message || 'Erro desconhecido'));
        }
    } catch (error) {
        alert('Erro de conexão com o servidor');
    }
}

function formatContact(contact) {
    if (!contact || contact === '—') return '—';
    
    if (contact.includes('@')) {
        return contact;
    }
    
    const numbers = contact.replace(/\D/g, '');
    if (numbers.length === 11) {
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return contact;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}