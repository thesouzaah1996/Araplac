/* ============================
   UI/JS - Almoxarifado
   ============================ */

const API_BASE = ""; // ex.: "http://localhost:8080"
const ENDPOINT = {
  LIST:   () => `${API_BASE}/api/itens`,
  CREATE: () => `${API_BASE}/api/itens`,
  UPDATE: (id) => `${API_BASE}/api/itens/${encodeURIComponent(id)}`,
  DELETE: (id) => `${API_BASE}/api/itens/${encodeURIComponent(id)}`,
};

const tbody = document.getElementById("tbody");
const formAdd  = document.getElementById("formAdd");
const formEdit = document.getElementById("formEdit");
const delItemEl = document.getElementById("delItem");
let currentDeleteId = null;
let itemsIndex = new Map();

/* ---------- Modais ---------- */
const openModal = (id) => document.getElementById(id).setAttribute("aria-hidden", "false");
const closeModals = () => document.querySelectorAll(".modal[aria-hidden='false']").forEach(m => m.setAttribute("aria-hidden","true"));

document.addEventListener("click", (e) => {
  const openId = e.target.getAttribute("data-open");
  if (openId) openModal(openId);
  if (e.target.matches("[data-close]") || e.target.classList.contains("modal")) closeModals();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });

/* ---------- Render ---------- */
function badge(status) {
  const cls = status === "OK" ? "ok" : status === "Baixo" ? "warn" : "err";
  return `<span class="badge ${cls}">${status}</span>`;
}

function rowTemplate(item) {
  const id = item.id ?? item.codigo;
  return `<tr data-id="${id}">
    <td>${item.codigo ?? ""}</td>
    <td>${item.descricao ?? ""}</td>
    <td>${item.categoria ?? ""}</td>
    <td>${item.unidade ?? ""}</td>
    <td>${item.quantidade ?? 0}</td>
    <td>${item.localizacao ?? ""}</td>
    <td>${badge(item.status ?? "OK")}</td>
    <td>${item.ultimaMov ?? ""}</td>
    <td class="actions-cell">
      <button class="btn btn-sm" data-action="edit" data-id="${id}">Editar</button>
      <button class="btn btn-sm btn-danger" data-action="delete" data-id="${id}">Remover</button>
    </td>
  </tr>`;
}

function render(items) {
  tbody.innerHTML = items.map(rowTemplate).join("");
  itemsIndex.clear();
  for (const it of items) {
    const id = String(it.id ?? it.codigo);
    itemsIndex.set(id, it);
  }
}

/* ---------- Load ---------- */
async function loadItems() {
  try {
    const res = await fetch(ENDPOINT.LIST(), { credentials: "include" });
    if (!res.ok) throw new Error("Falha ao carregar");
    const json = await res.json();
    render(Array.isArray(json) ? json : []);
  } catch (err) {
    console.warn("Erro ao carregar itens:", err.message);
    render([]);
  }
}

/* ---------- Add ---------- */
formAdd.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(formAdd).entries());
  payload.quantidade = Number(payload.quantidade || 0);
  try {
    const res = await fetch(ENDPOINT.CREATE(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Falha ao criar");
    const created = await res.json();
    const temp = document.createElement("tbody");
    temp.innerHTML = rowTemplate(created);
    tbody.prepend(temp.firstElementChild);
    itemsIndex.set(String(created.id ?? created.codigo), created);
    formAdd.reset();
    closeModals();
  } catch (err) {
    alert("Erro ao salvar. Verifique o backend.");
  }
});

/* ---------- Edit/Delete delegados ---------- */
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");

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
    formEdit.status.value = it.status ?? "OK";
    formEdit.ultimaMov.value = (it.ultimaMov ?? "").toString().substring(0,10);
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
document.getElementById("formEdit").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formEdit = e.currentTarget;
  const id = formEdit.id.value;
  const payload = Object.fromEntries(new FormData(formEdit).entries());
  payload.quantidade = Number(payload.quantidade || 0);
  try {
    const res = await fetch(ENDPOINT.UPDATE(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Falha ao atualizar");
    const updated = await res.json();
    const tr = tbody.querySelector(`tr[data-id="${CSS.escape(String(id))}"]`);
    if (tr) tr.outerHTML = rowTemplate(updated);
    itemsIndex.set(String(updated.id ?? updated.codigo), updated);
    closeModals();
  } catch (err) {
    alert("Erro ao atualizar. Verifique o backend.");
  }
});

/* ---------- Delete confirm ---------- */
document.getElementById("confirmDelete").addEventListener("click", async (e) => {
  e.preventDefault();
  if (!currentDeleteId) return;
  try {
    const res = await fetch(ENDPOINT.DELETE(currentDeleteId), {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Falha ao excluir");
    const tr = tbody.querySelector(`tr[data-id="${CSS.escape(String(currentDeleteId))}"]`);
    if (tr) tr.remove();
    itemsIndex.delete(String(currentDeleteId));
    currentDeleteId = null;
    closeModals();
  } catch (err) {
    alert("Erro ao excluir. Verifique o backend.");
  }
});

/* ---------- Logout (placeholder) ---------- */
document.getElementById("btnLogout").addEventListener("click", () => {
  // Integre com seu fluxo de sessão (Spring Security, etc.)
  alert("Logout (exemplo).");
});

/* ---------- Init ---------- */
loadItems();
