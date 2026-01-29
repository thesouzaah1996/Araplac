const API_BASE = "http://localhost:8080";
const ENDPOINT = {
  FORGOT: () => new URL("/api/auth/forgot-password", API_BASE).toString(),

function readCookie(name){
  return document.cookie.split("; ").map(v => v.split("=")).find(([k]) => k===name)?.[1];
}
function getCsrfToken(){
  return readCookie("XSRF-TOKEN") || document.querySelector('meta[name="csrf-token"]')?.content || "";
}

async function request(url, { method="GET", body, headers={}, timeoutMs=12000 } = {}){
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(new DOMException("Timeout","AbortError")), timeoutMs);

  const isJson = body !== undefined;
  const h = new Headers({
    "Accept": "application/json",
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...headers
  });
  if (["POST","PUT","PATCH","DELETE"].includes(method)){
    const csrf = getCsrfToken();
    if (csrf) h.set("X-CSRF-TOKEN", csrf);
  }

  const res = await fetch(url, {
    method, headers: h, body: isJson ? JSON.stringify(body) : undefined,
    credentials: "include", mode: "cors", signal: controller.signal
  }).finally(()=>clearTimeout(to));

  if (!res.ok){
    let msg = res.statusText;
    try { msg = (await res.json())?.message || msg; } catch(_) {}
    throw new Error(`${res.status} ${msg}`);
  }
  const ct = res.headers.get("Content-Type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

const form = document.getElementById("forgotForm");
const email = document.getElementById("email");
const emailErr = document.getElementById("emailErr");
const sendBtn = document.getElementById("sendBtn");

const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toastMsg");
const toastClose = document.getElementById("toastClose");

toast.hidden = true;
sendBtn.classList.remove("loading");
sendBtn.disabled = false;

function sanitizeEmail(v){ return String(v ?? "").trim(); }
function assertEmail(v){
  if (!v) throw new Error("Informe seu e-mail.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) throw new Error("E-mail inválido.");
}

function showToast(message, state="loading"){
  toast.hidden = false;
  toast.classList.remove("success","error");
  if (state === "success") toast.classList.add("success");
  if (state === "error")   toast.classList.add("error");
  toast.querySelector(".spinner").style.display = state === "loading" ? "inline-block" : "none";
  toastMsg.textContent = message;
}
function hideToast(){ toast.hidden = true; }
toastClose.addEventListener("click", hideToast);

function setLoading(state){
  sendBtn.classList.toggle("loading", state);
  sendBtn.disabled = state;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  emailErr.hidden = true; emailErr.textContent = "";
  setLoading(true);

  const value = sanitizeEmail(email.value);
  try{
    assertEmail(value);

    showToast("Enviando e-mail…", "loading");

    await request(ENDPOINT.FORGOT(), { method:"POST", body:{ email: value } });

    showToast("E-mail enviado! Verifique sua caixa de entrada e spam.", "success");
    setTimeout(()=>{ if (!toast.hidden) hideToast(); }, 7000);
  }catch(err){
    if (err.message.toLowerCase().includes("e-mail")) {
      email.setAttribute("aria-invalid","true");
      emailErr.hidden = false; emailErr.textContent = err.message;
    }
    showToast("Não foi possível enviar. Tente novamente.", "error");
  }finally{
    setLoading(false);
  }
});

email.addEventListener("keydown", (e) => { if (e.key === "Enter") form.requestSubmit(); });
