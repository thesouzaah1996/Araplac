/* ===========================
   Config & Endpoints
   =========================== */
const API_BASE = "http://localhost"; // backend via Nginx na porta 80
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

  if (!res.ok){
    let msg = res.statusText;
    try { msg = (await res.json())?.message || msg; } catch(_) {}
    const err = new Error(`${msg || "Erro"}`);
    err.status = res.status;
    throw err;
  }
  const ct = res.headers.get("Content-Type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

/* ===========================
   Helpers
   =========================== */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ===========================
   Validação / sanitização
   =========================== */
function sanitizeUsername(v){ return String(v ?? "").trim(); }
function sanitizePassword(v){ return String(v ?? ""); }
function assertLogin({username,password}){
  if (!username) throw new Error("Informe seu e-mail.");
  if (!password) throw new Error("Informe sua senha.");
}

/* ===========================
   DOM
   =========================== */
const form = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const togglePwd = document.getElementById("togglePwd");
const submitBtn = document.getElementById("submitBtn");
const formMsg = document.getElementById("formMsg");
const emailErr = document.getElementById("emailErr");
const passErr  = document.getElementById("passwordErr");

const topProgress = document.getElementById("topProgress");
const topNotice = document.getElementById("topNotice");

/* Helpers visuais topo */
function startTopProgress(){ topProgress?.classList.add("active"); }
function stopTopProgress(){ topProgress?.classList.remove("active"); }
function showTopNotice(message, type = "info", timeout = 3000){
  if (!topNotice) return;
  topNotice.textContent = message;
  topNotice.classList.remove("error","success","info");
  if (type) topNotice.classList.add(type);
  topNotice.hidden = false;
  requestAnimationFrame(() => topNotice.classList.add("show"));
  if (timeout > 0){
    setTimeout(() => {
      topNotice.classList.remove("show");
      setTimeout(() => { topNotice.hidden = true; }, 250);
    }, timeout);
  }
}

/* Mostrar/ocultar senha acessível */
togglePwd?.addEventListener("click", () => {
  const shown = password.type === "text";
  password.type = shown ? "password" : "text";
  togglePwd.setAttribute("aria-pressed", String(!shown));
  password.focus();
});

/* Remover estados ao digitar */
function clearFieldState(input){
  input.classList.remove("is-valid","is-invalid");
}
username.addEventListener("input", () => clearFieldState(username));
password.addEventListener("input", () => clearFieldState(password));

/* Submit */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();
  setLoading(true);

  // sanitiza
  const user = sanitizeUsername(username.value);
  const pass = sanitizePassword(password.value);

  // valida (lado do cliente)
  try{
    assertLogin({ username: user, password: pass });
  }catch(err){
    formMsg.classList.add("error");
    formMsg.textContent = err.message;
    if (!user){ showFieldError(username, emailErr, "Informe seu e-mail."); }
    if (!pass){ showFieldError(password, passErr, "Informe sua senha."); }
    setLoading(false);
    return;
  }

  try{
    startTopProgress();

    // >>> Backend ESPERA { usuario, senha }
    await request(ENDPOINT.LOGIN(), {
      method:"POST",
      body: { usuario: user, senha: pass } // sem "remember" para não arriscar desconhecido
    });

    // sucesso → bordas verdes + mensagem e só depois redirect
    username.classList.remove("is-invalid"); password.classList.remove("is-invalid");
    username.classList.add("is-valid");      password.classList.add("is-valid");

    formMsg.classList.remove("error");
    formMsg.textContent = "Login efetuado com sucesso! Redirecionando...";

    // Mostra aviso no topo e aguarda um pouquinho para o usuário ver
    showTopNotice("Login realizado com sucesso!", "success", 1800);

    // Desabilita campos para evitar novo envio enquanto mostramos a mensagem
    Array.from(form.elements).forEach(el => { try { el.disabled = true; } catch(_) {} });

    // Espera ~1.5s antes de redirecionar (ajuste se quiser mais/menos)
    await sleep(1600);

    window.location.href = "almoxarifado_manutencao.html";
  }catch(err){
    // erro → bordas vermelhas + aviso no topo
    username.classList.remove("is-valid"); password.classList.remove("is-valid");
    username.classList.add("is-invalid");   password.classList.add("is-invalid");

    formMsg.classList.add("error");
    if (err.status === 401){
      formMsg.textContent = "Usuário ou senha incorreta.";
      showTopNotice("Ops, usuário ou senha incorreta.", "error", 3500);
    }else if (err.name === "AbortError"){
      formMsg.textContent = "Tempo de conexão esgotado. Tente novamente.";
      showTopNotice("Tempo esgotado. Verifique sua conexão.", "error", 3500);
    }else{
      formMsg.textContent = err.message || "Falha no login.";
      showTopNotice("Não foi possível autenticar. Tente novamente.", "error", 3500);
    }

    if (!user){ showFieldError(username, emailErr, "Informe seu e-mail."); }
    if (!pass){ showFieldError(password, passErr, "Informe sua senha."); }
  }finally{
    stopTopProgress();
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
  hideFieldError(username, emailErr);
  hideFieldError(password, passErr);
  clearFieldState(username);
  clearFieldState(password);
}
function showFieldError(input, help, msg){
  input.setAttribute("aria-invalid", "true");
  help.hidden = false; help.textContent = msg;
  input.classList.add("is-invalid");
}
function hideFieldError(input, help){
  input.removeAttribute("aria-invalid");
  help.hidden = true; help.textContent = "";
}

/* UX extra: Enter no campo senha envia o form */
password.addEventListener("keydown", (e) => {
  if (e.key === "Enter") form.requestSubmit();
});

/* (Opcional) Recuperação de senha
const resetLink = document.getElementById("resetLink");
resetLink.addEventListener("click", async (e) => {
  e.preventDefault();
  const user = sanitizeUsername(username.value);
  if (!user){ username.focus(); return; }
  try{
    await request(ENDPOINT.FORGOT(), { method:"POST", body:{ username: user } });
    alert("Se o e-mail existir, enviaremos instruções de redefinição.");
  }catch(_){
    alert("Não foi possível iniciar a recuperação de senha.");
  }
});
*/
