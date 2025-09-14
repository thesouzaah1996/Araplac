/* ============================
   UI/JS - Almoxarifado
   ============================ */

const API_BASE = "http://localhost:8080";
const ENDPOINT = {
  LIST: () => `${API_BASE}/api/itens`,
  CREATE: () => `${API_BASE}/api/itens/salvar`,
  CREATE_MORE: () => `${API_BASE}/api/itens/salvar-varios-itens`,
  UPDATE: (id) => `${API_BASE}/api/itens/${encodeURIComponent(id)}`,
  DELETE: (id) => `${API_BASE}/api/itens/remover/${encodeURIComponent(id)}`,
};

const tbody = document.getElementById("tbody");
const formAdd = document.getElementById("formAdd");
const formEdit = document.getElementById("formEdit");
const delItemEl = document.getElementById("delItem");
const pager = document.getElementById("pagination");
const film = document.getElementById("filmOverlay");
let filmTimer = null, filmAlpha = 0;

let currentDeleteId = null;
let itemsIndex = new Map();
let itemsAll = [];
const PAGE_SIZE = 8;
let currentPage = 1;

/* ---------- Categoria: enum <-> label ---------- */
const CategoriaLabel = {
  MATERIA_PRIMA: "Matéria-prima",
  FERRAGEM: "Ferragem",
  ACABAMENTO: "Acabamento",
  CONSUMIVEIS: "Consumíveis",
  EMBALAGENS: "Embalagens",
  EPI: "EPI",
};
const enumToLabel = (v) => CategoriaLabel[v] || v || "";

/* ---------- Helpers ---------- */
const openModal = (id) => document.getElementById(id).setAttribute("aria-hidden", "false");
function closeModals() {
  document.querySelectorAll(".modal[aria-hidden='false']").forEach(m => m.setAttribute("aria-hidden","true"));
  stopFilm();
}
document.addEventListener("click", (e) => {
  const openId = e.target.getAttribute("data-open");
  if (openId) openModal(openId);
  if (e.target.matches("[data-close]") || e.target.classList.contains("modal")) closeModals();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });

function fmtDate(d) {
  if (!d) return "";
  const date = typeof d === "string"
    ? (d.length <= 10 ? new Date(`${d}T00:00:00`) : new Date(d))
    : d;
  return isNaN(date) ? String(d) : date.toLocaleDateString("pt-BR");
}
function fromBackend(it) {
  return {
    id: it.id,
    codigo: it.codigo ?? it.codigoProduto ?? "",
    descricao: it.descricao ?? "",
    categoria: it.categoria ?? "",
    unidade: it.unidade ?? "",
    quantidade: it.quantidade ?? 0,
    localizacao: it.localizacao ?? it.localizacaoPrateleira ?? "",
    ultimaMov: it.ultimaMov ?? it.data ?? "",
    responsavelRecebimento: it.responsavelRecebimento ?? it["responsávelRecebimento"] ?? "",
  };
}
function toBackendPayload(formEl) {
  const fd = new FormData(formEl);
  const categoria = (fd.get("categoria") || "").toString().trim().toUpperCase();
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
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ---------- Render + paginação ---------- */
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
      <button class="btn btn-sm" data-action="view"  data-id="${id}">Ver</button>
      <button class="btn btn-sm" data-action="edit"  data-id="${id}">Editar</button>
      <button class="btn btn-sm btn-danger" data-action="delete" data-id="${id}">Remover</button>
    </td>
  </tr>`;
}
function render(items) {
  tbody.innerHTML = items.map(rowTemplate).join("");
  itemsIndex.clear();
  for (const it of itemsAll) itemsIndex.set(String(it.id ?? it.codigo), it);
}
function slicePage(list, page) {
  const start = (page - 1) * PAGE_SIZE;
  return list.slice(start, start + PAGE_SIZE);
}
function renderPagination(maxPage) {
  if (!pager) return;
  let html = `<button class="page-btn" data-page="prev" ${currentPage===1?'disabled':''}>‹</button>`;
  for (let p = 1; p <= maxPage; p++) {
    html += `<button class="page-btn ${p===currentPage?'active':''}" data-page="${p}">${p}</button>`;
  }
  html += `<button class="page-btn" data-page="next" ${currentPage===maxPage?'disabled':''}>›</button>`;
  pager.innerHTML = html;
}
if (pager) {
  pager.addEventListener("click", (e) => {
    const b = e.target.closest(".page-btn");
    if (!b) return;
    const maxPage = Math.max(1, Math.ceil(itemsAll.length / PAGE_SIZE));
    const v = b.getAttribute("data-page");
    if (v === "prev") currentPage = Math.max(1, currentPage - 1);
    else if (v === "next") currentPage = Math.min(maxPage, currentPage + 1);
    else currentPage = Number(v) || 1;
    render(slicePage(itemsAll, currentPage));
    renderPagination(maxPage);
  });
}
function renderPage(page = 1) {
  const maxPage = Math.max(1, Math.ceil(itemsAll.length / PAGE_SIZE));
  currentPage = Math.min(Math.max(1, page), maxPage);
  render(slicePage(itemsAll, currentPage));
  renderPagination(maxPage);
}

/* ---------- Load ---------- */
async function loadItems() {
  try {
    const res = await fetch(ENDPOINT.LIST());
    if (!res.ok) throw new Error(`Falha ao carregar (${res.status})`);
    const json = await res.json();
    itemsAll = (Array.isArray(json) ? json : []).map(fromBackend);
    renderPage(1);
  } catch (err) {
    console.warn("Erro ao carregar itens:", err.message);
    itemsAll = [];
    renderPage(1);
  }
}

/* ---------- Add ---------- */
formAdd?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = toBackendPayload(formAdd);

  try {
    const res = await fetch(ENDPOINT.CREATE(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Falha ao criar (${res.status} ${res.statusText}) ${text}`);
    }
    const created = fromBackend(await res.json());
    itemsAll.unshift(created);
    renderPage(1);
    formAdd.reset();
    closeModals();
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar. Verifique o backend.");
  }
});

/* ---------- Delegação de ações ---------- */
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");

  if (action === "view") {
    const it = itemsIndex.get(String(id));
    if (!it) return;
    document.getElementById("vCodigo").textContent = it.codigo ?? "";
    document.getElementById("vDescricao").textContent = it.descricao ?? "";
    document.getElementById("vCategoria").textContent = enumToLabel(it.categoria);
    document.getElementById("vUnidade").textContent = it.unidade ?? "";
    document.getElementById("vQuantidade").textContent = it.quantidade ?? 0;
    document.getElementById("vLocalizacao").textContent = it.localizacao ?? "";
    document.getElementById("vUltimaMov").textContent = fmtDate(it.ultimaMov);
    document.getElementById("vResp").textContent = it.responsavelRecebimento ?? "";
    document.getElementById("vhCodigoChip").textContent = it.codigo ?? "—";
    const status = statusFromQuantity(it.quantidade);
    document.getElementById("vhStatus").textContent = `Status: ${status}`;
    document.getElementById("vhUnidade").textContent = `Unidade: ${it.unidade ?? ""}`;
    openModal("viewModal");
  }

  if (action === "edit") {
    const it = itemsIndex.get(String(id));
    if (!it) return;
    formEdit.id.value = it.id ?? it.codigo ?? "";
    formEdit.codigo.value = it.codigo ?? "";
    formEdit.descricao.value = it.descricao ?? "";
    formEdit.categoria.value = it.categoria ?? "";
    formEdit.unidade.value = it.unidade ?? "";
    formEdit.quantidade.value = it.quantidade ?? 0;
    formEdit.localizacao.value = it.localizacao ?? "";
    formEdit.ultimaMov.value = (typeof it.ultimaMov === "string" ? it.ultimaMov : "").toString().substring(0,10);
    openModal("editModal");
  }

  if (action === "delete") {
    const it = itemsIndex.get(String(id));
    currentDeleteId = id;
    delItemEl.textContent = it ? `${it.codigo ?? id} — ${it.descricao ?? ""}` : id;
    openModal("deleteModal");
  }
});

/* ---------- Edit submit ---------- */
formEdit?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = e.currentTarget.id.value;
  const payload = toBackendPayload(e.currentTarget);

  try {
    const res = await fetch(ENDPOINT.UPDATE(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Falha ao atualizar (${res.status})`);
    const updated = fromBackend(await res.json());

    const idx = itemsAll.findIndex(it => String(it.id ?? it.codigo) === String(id));
    if (idx >= 0) itemsAll[idx] = updated;

    renderPage(currentPage);
    closeModals();
  } catch (err) {
    console.error(err);
    alert("Erro ao atualizar. Verifique o backend.");
  }
});

/* ---------- Delete confirm ---------- */
document.getElementById("confirmDelete").addEventListener("click", async (e) => {
  e.preventDefault();
  if (!currentDeleteId) return;
  try {
    const res = await fetch(ENDPOINT.DELETE(currentDeleteId), { method: "DELETE" });
    if (!res.ok) throw new Error(`Falha ao excluir (${res.status})`);
    itemsAll = itemsAll.filter(it => String(it.id ?? it.codigo) !== String(currentDeleteId));
    currentDeleteId = null;
    renderPage(currentPage);
    closeModals();
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir. Verifique o backend.");
  }
});

/* ---------- Logout + efeito filme ---------- */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal("logoutModal");
    startFilm();
  });
}
const confirmLogoutBtn = document.getElementById("confirmLogout");
if (confirmLogoutBtn) {
  confirmLogoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    stopFilm();
    closeModals();
    alert("Logout (exemplo).");
  });
}
function startFilm() {
  if (!film) return;
  filmAlpha = 0;
  film.style.background = "rgba(0,0,0,0)";
  film.style.display = "block";
  clearInterval(filmTimer);
  filmTimer = setInterval(() => {
    filmAlpha = Math.min(0.65, filmAlpha + 0.06);
    film.style.background = `rgba(0,0,0,${filmAlpha})`;
  }, 700);
}
function stopFilm() {
  if (!film) return;
  clearInterval(filmTimer);
  film.style.background = "rgba(0,0,0,0)";
  film.style.display = "none";
}

// fecha o <details> ao clicar fora
document.addEventListener("click", (e) => {
  const d = document.querySelector(".profile");
  if (!d) return;
  if (!d.contains(e.target)) d.removeAttribute("open");
});


/* ---------- Init ---------- */
loadItems();
