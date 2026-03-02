let queue = [
    {
        id: 1,
        notaFiscal: 'NF-20001',
        motorista: 'João Silva',
        placa: 'ABC-1234',
        setor: 'Almoxarifado',
        status: 'aguardando',
        timestamp: Date.now() - 20 * 60 * 1000
    }
];

let historico = [];
let nextId = 2;
let removeId = null;
let confirmId = null;

function renderQueue() {
    const tbody = document.getElementById('queueTable');
    const emptyMessage = document.getElementById('queueEmptyMessage');

    if (!tbody) return;

    if (queue.length === 0) {
        tbody.innerHTML = '';
        if (emptyMessage) emptyMessage.style.display = 'block';
        return;
    }

    if (emptyMessage) emptyMessage.style.display = 'none';

    let html = '';

    queue.forEach(item => {

        let primaryButton = '';

        if (item.status === 'aguardando') {
            primaryButton = `
                <button class="btn btn-sm btn-secondary me-1" disabled>
                    <i class="bi bi-hourglass"></i> Aguardando autorização
                </button>
            `;
        }

        if (item.status === 'autorizado') {
            primaryButton = `
                <button class="btn btn-sm btn-primary me-1">
                    <i class="bi bi-truck"></i> Entrada autorizada
                </button>
            `;
        }

        const actionsHtml = `
            ${primaryButton}

            <button class="btn btn-sm btn-success me-1"
                ${item.status !== 'autorizado' ? 'disabled' : ''}
                onclick="openConfirmModal(${item.id})">
                <i class="bi bi-check-circle"></i>
            </button>

            <button class="btn btn-sm btn-danger"
                onclick="openRemoveModal(${item.id})">
                <i class="bi bi-x-circle"></i>
            </button>
        `;

        html += `
            <tr>
                <td>${item.notaFiscal}</td>
                <td>${item.motorista}</td>
                <td>${item.placa}</td>
                <td>${item.setor}</td>
                <td>${formatWaitTime(item.timestamp)}</td>
                <td class="text-end">${actionsHtml}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function handleCheckinSubmit(e) {
    e.preventDefault();

    const notaFiscal = document.getElementById('notaFiscal').value.trim();
    const motorista = document.getElementById('motorista').value.trim();
    const placa = document.getElementById('placa').value.trim();
    const setor = document.getElementById('setor').value;

    if (!notaFiscal || !motorista || !placa || !setor) {
        showAlert('Preencha todos os campos obrigatórios.', 'danger');
        return;
    }

    const novo = {
        id: nextId++,
        notaFiscal,
        motorista,
        placa,
        setor,
        status: 'aguardando',
        timestamp: Date.now()
    };

    queue.push(novo);
    renderQueue();
    e.target.reset();

    showAlert('Caminhão adicionado à fila.', 'success');
}


function autorizarEntrada(id) {
    const item = queue.find(t => t.id === id);
    if (item) {
        item.status = 'autorizado';
        renderQueue();
    }
}


function openConfirmModal(id) {
    confirmId = id;
    const modal = new bootstrap.Modal(document.getElementById('confirmEntradaModal'));
    modal.show();
}

function confirmarEntrada() {
    const index = queue.findIndex(t => t.id === confirmId);

    if (index !== -1) {
        const truck = queue[index];

        historico.push({
            id: Date.now(),
            notaFiscal: truck.notaFiscal,
            motorista: truck.motorista,
            placa: truck.placa,
            setor: truck.setor,
            status: 'Entrada confirmada',
            dataEntrada: new Date().toISOString()
        });

        queue.splice(index, 1);
        renderQueue();
    }

    confirmId = null;
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmEntradaModal'));
    modal.hide();

    showAlert('Entrada confirmada e movida para histórico.', 'success');
}


function openRemoveModal(id) {
    removeId = id;
    const modal = new bootstrap.Modal(document.getElementById('removeConfirmModal'));
    modal.show();
}

function confirmRemove() {
    if (removeId) {
        queue = queue.filter(t => t.id !== removeId);
        renderQueue();
        removeId = null;
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('removeConfirmModal'));
    modal.hide();
}

function formatWaitTime(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) return `${hours}h ${remainingMinutes}min`;
    return `${minutes} min`;
}

function showAlert(message, type = 'success') {
    const container = document.getElementById('alertContainer');
    if (!container) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = '9999';

    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    container.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 4000);
}


document.addEventListener('DOMContentLoaded', () => {
    renderQueue();

    const form = document.getElementById('checkinForm');
    if (form) {
        form.addEventListener('submit', handleCheckinSubmit);
    }
});