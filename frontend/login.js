(() => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePwdBtn = document.getElementById("togglePwd");
  const formMsg = document.getElementById("formMsg");
  const submitBtn = document.getElementById("submitBtn");

  togglePwdBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    togglePwdBtn.setAttribute("aria-pressed", String(isHidden));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formMsg.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError("Informe usuário e senha.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8090/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error("Credenciais inválidas");
      }

      const data = await response.json();
      showSuccess("Login realizado com sucesso!");

      // exemplo:
      // localStorage.setItem("token", data.token);
      // window.location.href = "/dashboard.html";

    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Entrando..." : "Entrar";
  }

  function showError(message) {
    formMsg.textContent = message;
    formMsg.style.color = "#d01919";
  }

  function showSuccess(message) {
    formMsg.textContent = message;
    formMsg.style.color = "#2e7d32";
  }
})();
