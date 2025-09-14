/* ============================
   UI/JS - Almoxarifado
   ============================ */

const API_BASE = "http://localhost:8080";

const ENDPOINT = {
  LIST:   () => `${API_BASE}/api/itens`,
  CREATE: () => `${API_BASE}/api/itens/salvar`,
  UPDATE: (id) => `${API_BASE}/api/itens/${encodeURIComponent(id)}`,
  DELETE: (id) => `${API_BASE}/api/itens/${encodeURIComponent(id)}`,
};

const tbody    = document.getElementById("tbody");
const formAdd  = document.getElementById("formAdd");
const formEdit = document.getElementById("formEdit");
const delItemEl = document.getElementById("delItem");

let currentDeleteId = null;
let itemsIndex = new Map();

/* ---------- Categoria: enum <-> label (aceita número do banco) ---------- */
const CategoriaOrder = [
  "MATERIA_PRIMA","FERRAGEM","ACABAMENTO","CONSUMIVEIS","EMBALAGENS","EPI"
];
const CategoriaLabel = {
  MATERIA_PRIMA: "Matéria-prima",
  FERRAGEM: "Ferragem",
  ACABAMENTO: "Acabamento",
  CONSUMIVEIS: "Consumíveis",
  EMBALAGENS: "Embalagens",
  EPI: "EPI",
};
function normalizeCategoria(v){
  if (v == null) return "";
  const s = String(v).trim();
  if (/^\d+$/.test(s)) {
    const idx = Math.max(1, Math.min(6, parseInt(s,10))) - 1;
    return CategoriaOrder[idx];
  }
  return s.toUpperCase();
}
const enumToLabel = (v) => CategoriaLabel[normalizeCategoria(v)] || "";

/* ---------- Helpers ---------- */
const openModal = (id) => document.getElementById(id).setAttribute("aria-hidden", "false");
const closeModals = () => document.querySelectorAll(".modal[aria-hidden='false']").forEach(m => m.setAttribute("aria-hidden","true"));

document.addEventListener("click", (e) => {
  const openId = e.target.getAttribute("data-open");
  if (openId) openModal(openId);
  if (e.target.matches("[data-close]") || e.target.classList.contains("modal")) closeModals();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });

function fmtDate(d) {
  if (!d) return "";
  const date = typeof d === "string" ? (d.length <= 10 ? new Date(`${d}T00:00:00`) : new Date(d)) : d;
  return isNaN(date) ? String(d) : date.toLocaleDateString("pt-BR");
}

function fromBackend(it) {
  return {
    id: it.id,
    codigo: it.codigo ?? it.codigoProduto ?? "",
    descricao: it.descricao ?? "",
    categoria: normalizeCategoria(it.categoria ?? ""),
    unidade: it.unidade ?? "",
    quantidade: it.quantidade ?? 0,
    localizacao: it.localizacao ?? it.localizacaoPrateleira ?? "",
    ultimaMov: it.ultimaMov ?? it.data ?? "",
    responsavelRecebimento: it.responsavelRecebimento ?? it["responsávelRecebimento"] ?? it["responsável_recebimento"] ?? "",
  };
}

function toBackendPayload(formEl) {
  const fd = new FormData(formEl);
  const categoria = normalizeCategoria(fd.get("categoria") || "");
  const dataField = fd.get("ultimaMov");
  const dataISO = dataField ? `${dataField}T00:00:00` : null;

  const payload = {
    codigoProduto: fd.get("codigo") || "",
    descricao: fd.get("descricao") || "",
    categoria,
    unidade: fd.get("unidade") || "",
    quantidade: Number(fd.get("quantidade") || 0),
    localizacaoPrateleira: fd.get("localizacao") || "",
    data: dataISO,
  };
  payload["responsávelRecebimento"] = fd.get("responsavelRecebimento") || "";
  return payload;
}

function statusFromQuantity(q) {
  const n = Number(q || 0);
  if (n <= 0) return "Crítico";
  if (n <= 10) return "Baixo";
  return "OK";
}
function badge(status) {
  const cls = status === "OK" ? "ok" : status === "Baixo" ? "warn" : "err";
  return `<span class="badge ${cls}">${status}</span>`;
}
function escapeHtml(s) {
  return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

/* ---------- Render ---------- */
function rowTemplate(item) {
  const id = item.id ?? item.codigo;
  const status = statusFromQuantity(item.quantidade);
  return `<tr data-id="${id}">
    <td>${escapeHtml(item.codigo ?? "")}</td>
    <td class="td-desc"><span class="line-clamp-1" title="${escapeHtml(item.descricao ?? "")}">${escapeHtml(item.descricao ?? "")}</span></td>
    <td>${escapeHtml(enumToLabel(item.categoria))}</td>
    <td>${escapeHtml(item.unidade ?? "")}</td>
    <td>${item.quantidade ?? 0}</td>
    <td>${escapeHtml(item.localizacao ?? "")}</td>
    <td>${badge(status)}</td>
    <td>${fmtDate(item.ultimaMov)}</td>
    <td class="actions-cell">
      <button class="btn btn-sm btn-ghost" data-action="view"  data-id="${id}">Ver</button>
      <button class="btn btn-sm btn-ghost" data-action="edit"  data-id="${id}">Editar</button>
      <button class="btn btn-sm btn-danger" data-action="delete" data-id="${id}">Remover</button>
    </td>
  </tr>`;
}

function render(items) {
  tbody.innerHTML = items.map(rowTemplate).join("");
  itemsIndex.clear();
  for (const it of items) itemsIndex.set(String(it.id ?? it.codigo), it);
}

/* ---------- Load ---------- */
async function loadItems() {
  try {
    const res = await fetch(ENDPOINT.LIST());
    if (!res.ok) throw new Error(`Falha ao carregar (${res.status})`);
    const json = await res.json();
    render((Array.isArray(json) ? json : []).map(fromBackend));
  } catch (err) {
    console.warn("Erro ao carregar itens:", err.message);
    render([]);
  }
}

/* ---------- Add ---------- */
formAdd.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = toBackendPayload(formAdd);
  try {
    const res = await fetch(ENDPOINT.CREATE(), { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { const t = await res.text().catch(()=> ""); throw new Error(`Falha ao criar (${res.status} ${res.statusText}) ${t}`); }
    const created = fromBackend(await res.json());
    const temp = document.createElement("tbody"); temp.innerHTML = rowTemplate(created);
    tbody.prepend(temp.firstElementChild);
    itemsIndex.set(String(created.id ?? created.codigo), created);
    formAdd.reset(); closeModals();
  } catch (err) { console.error(err); alert("Erro ao salvar. Verifique o backend."); }
});

/* ---------- Delegados: view / edit / delete ---------- */
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");
  const it = itemsIndex.get(String(id));
  if (!it) return;

  if (action === "view") {
    // chips
    document.getElementById("vhCodigoChip").textContent = it.codigo ?? "—";
    const st = statusFromQuantity(it.quantidade);
    const statusEl = document.getElementById("vhStatus");
    statusEl.textContent = `Status: ${st}`;
    statusEl.className = `pill ${st==='OK'?'pill-ok':st==='Baixo'?'pill-warn':'pill-err'}`;

    const undEl = document.getElementById("vhUnidade");
    undEl.textContent = `Unidade: ${it.unidade || '—'}`;
    undEl.className = "pill";

    // props
    document.getElementById("vCodigo").textContent = it.codigo ?? "";
    document.getElementById("vDescricao").textContent = it.descricao ?? "";
    document.getElementById("vCategoria").textContent = enumToLabel(it.categoria);
    document.getElementById("vUnidade").textContent = it.unidade ?? "";
    document.getElementById("vQuantidade").textContent = it.quantidade ?? 0;
    document.getElementById("vLocalizacao").textContent = it.localizacao ?? "";
    document.getElementById("vUltimaMov").textContent = fmtDate(it.ultimaMov);
    document.getElementById("vResp").textContent = it.responsavelRecebimento ?? "";

    openModal("viewModal");
    return;
  }

  if (action === "edit") {
    formEdit.elements["id"].value = it.id ?? it.codigo ?? "";
    formEdit.elements["codigo"].value = it.codigo ?? "";
    formEdit.elements["descricao"].value = it.descricao ?? "";
    formEdit.elements["categoria"].value = normalizeCategoria(it.categoria) || "";
    formEdit.elements["unidade"].value = it.unidade ?? "";
    formEdit.elements["quantidade"].value = it.quantidade ?? 0;
    formEdit.elements["localizacao"].value = it.localizacao ?? "";
    formEdit.elements["ultimaMov"].value = (typeof it.ultimaMov === "string" ? it.ultimaMov : "").toString().substring(0,10);
    if (formEdit.elements["responsavelRecebimento"]) formEdit.elements["responsavelRecebimento"].value = it.responsavelRecebimento ?? "";
    openModal("editModal");
    return;
  }

  if (action === "delete") {
    currentDeleteId = id;
    delItemEl.textContent = `${it.codigo ?? id} — ${it.descricao ?? ""}`;
    openModal("deleteModal");
    return;
  }
});

/* ---------- Edit submit ---------- */
document.getElementById("formEdit").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = e.currentTarget.elements["id"].value;
  const payload = toBackendPayload(e.currentTarget);
  try {
    const res = await fetch(ENDPOINT.UPDATE(id), { method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`Falha ao atualizar (${res.status})`);
    const updated = fromBackend(await res.json());
    const tr = tbody.querySelector(`tr[data-id="${CSS.escape(String(id))}"]`);
    if (tr) tr.outerHTML = rowTemplate(updated);
    itemsIndex.set(String(updated.id ?? updated.codigo), updated);
    closeModals();
  } catch (err) { console.error(err); alert("Erro ao atualizar. Verifique o backend."); }
});

/* ---------- Delete confirm ---------- */
document.getElementById("confirmDelete").addEventListener("click", async (e) => {
  e.preventDefault();
  if (!currentDeleteId) return;
  try {
    const res = await fetch(ENDPOINT.DELETE(currentDeleteId), { method:"DELETE" });
    if (!res.ok) throw new Error(`Falha ao excluir (${res.status})`);
    const tr = tbody.querySelector(`tr[data-id="${CSS.escape(String(currentDeleteId))}"]`);
    if (tr) tr.remove();
    itemsIndex.delete(String(currentDeleteId));
    currentDeleteId = null;
    closeModals();
  } catch (err) { console.error(err); alert("Erro ao excluir. Verifique o backend."); }
});

/* ---------- Logout (placeholder) ---------- */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) logoutBtn.addEventListener("click", (e) => { e.preventDefault(); alert("Logout (exemplo)."); });

/* ---------- Init ---------- */
loadItems();
