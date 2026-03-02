const LIMITE_ESPERA_MINUTOS = 60;

let fila = [
    {
        empresa: "Madeiras União",
        produto: "MDF 15mm",
        chegada: new Date(Date.now() - 30 * 60000),
        motorista: "Carlos Silva",
        status: "Aguardando"
    },
    {
        empresa: "Trans Horizonte",
        produto: "Ferragens",
        chegada: new Date(Date.now() - 90 * 60000),
        motorista: "João Mendes",
        status: "Aguardando"
    }
];

let historico = [];
let indexAtual = null;

document.addEventListener("DOMContentLoaded", () => {
    verificarTempoEspera();
    renderFila();
    setInterval(verificarTempoEspera, 60000);
});

function verificarTempoEspera() {
    const agora = new Date();

    fila.forEach(item => {
        const diffMin = (agora - new Date(item.chegada)) / 60000;

        if (diffMin >= LIMITE_ESPERA_MINUTOS) {
            item.status = "Aguardando há mais de 1 hora";
        } else {
            item.status = "Aguardando";
        }
    });

    renderFila();
}

function renderFila() {
    const tbody = document.getElementById("filaTable");

    tbody.innerHTML = fila.map((c, index) => {

        let badgeClass = "bg-primary";
        let rowClass = "";

        if (c.status.includes("1 hora")) {
            badgeClass = "bg-danger";
            rowClass = "table-danger";
        }

        return `
        <tr class="${rowClass}">
            <td class="fw-semibold">${c.empresa}</td>
            <td>${c.produto}</td>
            <td>${formatarHora(c.chegada)}</td>
            <td>${c.motorista}</td>
            <td>
                <span class="badge ${badgeClass}">
                    ${c.status}
                </span>
            </td>
            <td class="text-end">
                <button class="btn btn-success btn-sm"
                    onclick="abrirModal(${index})">
                    <i class="bi bi-check-circle"></i>
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

function abrirModal(index) {
    indexAtual = index;
    document.getElementById("modalObservacao").value = "";
    document.getElementById("modalDependencia").checked = false;

    const modal = new bootstrap.Modal(
        document.getElementById('finalizarModal')
    );
    modal.show();
}

function confirmarFinalizacao() {
    const obs = document.getElementById("modalObservacao").value.trim();
    const dependencia = document.getElementById("modalDependencia").checked;

    if (!obs) {
        alert("Observações são obrigatórias.");
        return;
    }

    const item = fila[indexAtual];

    item.status = dependencia ? "Dependência" : "Finalizado";
    item.data = new Date().toLocaleDateString();
    item.obs = obs;

    historico.push(item);
    fila.splice(indexAtual, 1);

    bootstrap.Modal.getInstance(
        document.getElementById('finalizarModal')
    ).hide();

    renderFila();
    renderHistorico();
    showSuccess("Entrega finalizada com sucesso.");
}

function formatarHora(data) {
    return new Date(data).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function toggleHistorico() {
    const section = document.getElementById("historicoSection");
    section.style.display =
        section.style.display === "none" ? "block" : "none";
    renderHistorico();
}

function renderHistorico() {
    const tbody = document.getElementById("historicoTable");

    if (!historico.length) {
        tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4 text-muted">
                Nenhuma entrega finalizada.
            </td>
        </tr>`;
        return;
    }

    tbody.innerHTML = historico.map(h => `
        <tr>
            <td>${h.empresa}</td>
            <td>${h.produto}</td>
            <td>${h.motorista}</td>
            <td>${h.data}</td>
            <td>
                <span class="badge ${h.status === 'Dependência' ? 'bg-warning text-dark' : 'bg-success'}">
                    ${h.status}
                </span>
            </td>
            <td class="text-end text-muted">${h.obs}</td>
        </tr>
    `).join('');
}

function showSuccess(msg) {
    const container = document.getElementById('alertContainer');
    container.innerHTML = `
        <div class="alert alert-success alert-toast">
            <i class="bi bi-check-circle-fill me-2"></i>
            ${msg}
        </div>
    `;
    setTimeout(() => container.innerHTML = '', 3000);
}