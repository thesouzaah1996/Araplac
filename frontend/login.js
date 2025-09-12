/* ===========================
   Config & Endpoints
   =========================== */
const API_BASE = "http://localhost:8080"; // ajuste para seu backend
const ENDPOINT = {
  LOGIN:  () => new URL("/api/auth/login",  API_BASE).toString(),  // POST
  LOGOUT: () => new URL("/api/auth/logout", API_BASE).toString(),  // POST
  FORGOT: () => new URL("/api/auth/forgot-password", API_BASE).toString(), // (opcional) POST
};

/* ===========================
   Utils: CSRF / fetch seguro
   =========================== */
function readCookie(name){
  return document.cookie
    .split("; ")
    .map(v => v.split("="))
    .find(([k]) => k === name)?.[1];
}
function getCsrfToken(){
  // Cookie httpOnly recomendado no servidor; como fallback, meta
  return readCookie("XSRF-TOKEN") || document.querySelector('meta[name="csrf-token"]')?.content || "";
}

async function request(url, { method = "GET", body, headers = {}, timeoutMs = 12000 } = {}){
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
    method, headers: h,
    body: isJson ? JSON.stringify(body) : undefined,
    credentials: "include", // sessão via cookie httpOnly
    mode: "cors",
    signal: controller.signal
  }).finally(() => clearTimeout(to));

  if (res.status === 401 || res.status === 419){
    throw new Error("Sessão inválida ou expirada.");
  }
  if (!res.ok){
    let msg = res.statusText;
    try { msg = (await res.json())?.message || msg; } catch(_) {}
    throw new Error(`${res.status} ${msg}`);
  }
  const ct = res.headers.get("Content-Type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

/* ===========================
   Validação / sanitização
   =========================== */
function sanitizeEmail(v){ return String(v ?? "").trim(); }
function sanitizePassword(v){ return String(v ?? ""); }
function assertLogin({username,password}){
  if (!username) throw new Error("Informe seu e-mail.");
  if (!password) throw new Error("Informe sua senha.");
}

/* ===========================
   DOM
   =========================== */
const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const togglePwd = document.getElementById("togglePwd");
const submitBtn = document.getElementById("submitBtn");
const formMsg = document.getElementById("formMsg");
const emailErr = document.getElementById("emailErr");
const passErr  = document.getElementById("passwordErr");

/* Mostrar/ocultar senha acessível */
togglePwd.addEventListener("click", () => {
  const shown = password.type === "text";
  password.type = shown ? "password" : "text";
  togglePwd.setAttribute("aria-pressed", String(!shown));
  password.focus();
});

/* Link recuperar senha (opcional, caso use endpoint) */
// const resetLink = document.getElementById("resetLink");
// resetLink.addEventListener("click", async (e) => {
//   e.preventDefault();
//   const username = sanitizeEmail(email.value);
//   if (!username){ email.focus(); return; }
//   try{
//     await request(ENDPOINT.FORGOT(), { method:"POST", body:{ username } });
//     alert("Se o e-mail existir, enviaremos instruções de redefinição.");
//   }catch(err){
//     alert("Não foi possível iniciar a recuperação de senha.");
//   }
// });

/* Submit */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();
  setLoading(true);

  const payload = {
    username: sanitizeEmail(email.value),
    password: sanitizePassword(password.value),
    remember: document.getElementById("remember").checked
  };

  try{
    assertLogin(payload);
    // O backend deve autenticar e setar cookie httpOnly de sessão
    await request(ENDPOINT.LOGIN(), { method:"POST", body: payload });
    formMsg.classList.remove("error");
    formMsg.textContent = "Login efetuado. Redirecionando...";
    window.location.href = "/"; // ajuste sua rota pós-login
  }catch(err){
    formMsg.classList.add("error");
    formMsg.textContent = err.message || "Falha no login.";
    if (!payload.username){ showFieldError(email, emailErr, "Informe seu e-mail."); }
    if (!payload.password){ showFieldError(password, passErr, "Informe sua senha."); }
  }finally{
    setLoading(false);
  }
});

/* Helpers visuais */
function setLoading(state){
  submitBtn.classList.toggle("loading", state);
  submitBtn.disabled = state;
}
function clearErrors(){
  formMsg.classList.remove("error");
  formMsg.textContent = "";
  hideFieldError(email, emailErr);
  hideFieldError(password, passErr);
}
function showFieldError(input, help, msg){
  input.setAttribute("aria-invalid", "true");
  help.hidden = false; help.textContent = msg;
}
function hideFieldError(input, help){
  input.removeAttribute("aria-invalid");
  help.hidden = true; help.textContent = "";
}

/* UX extra: Enter no campo senha envia o form */
password.addEventListener("keydown", (e) => {
  if (e.key === "Enter") form.requestSubmit();
});
