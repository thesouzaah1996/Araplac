(() => {
  const API_URL = "http://localhost:8090/api/auth/login";
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.getElementById("submitBtn");
  const topProgress = document.getElementById("topProgress");
  const card = document.querySelector('.card');
  const fields = document.querySelectorAll('.field');

  const errors = {
    email: document.getElementById("emailErr"),
    password: document.getElementById("passwordErr")
  };

  function showLoginSuccess() {
    card.classList.remove('login-error');
    card.classList.add('login-success');
    
    fields.forEach(field => {
      field.classList.remove('login-error');
      field.classList.add('login-success');
    });
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Redirecionando...';
    
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  }

  function showLoginError(message = "E-mail ou senha incorretos") {
    card.classList.remove('login-success');
    card.classList.add('login-error');
    
    fields.forEach(field => {
      field.classList.remove('login-success');
      field.classList.add('login-error');
    });
    
    showError('password', message);
    clearError('email');
  }

  function clearLoginStates() {
    card.classList.remove('login-success', 'login-error');
    
    fields.forEach(field => {
      field.classList.remove('login-success', 'login-error');
    });
    
    clearAllErrors();
  }

  function setLoading(state) {
    submitBtn.disabled = state;
    if (state) {
      submitBtn.classList.add("loading");
      topProgress.classList.add("active");
    } else {
      submitBtn.classList.remove("loading");
      topProgress.classList.remove("active");
    }
  }

  function showError(field, message) {
    errors[field].textContent = message;
    errors[field].hidden = false;
    const input = document.getElementById(field);
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
  }

  function clearError(field) {
    errors[field].textContent = "";
    errors[field].hidden = true;
    const input = document.getElementById(field);
    input.classList.remove("is-invalid", "is-valid");
  }

  function clearAllErrors() {
    Object.keys(errors).forEach(clearError);
  }

  function validateEmail(email) {
    if (!email) return "E-mail é obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Digite um e-mail válido";
    return "";
  }

  function validatePassword(password) {
    if (!password) return "Senha é obrigatória";
    return "";
  }

  document.getElementById("togglePwd").addEventListener("click", function() {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    this.setAttribute("aria-pressed", isPassword);
    this.textContent = isPassword ? "🙈" : "👁";
  });

  emailInput.addEventListener("input", () => {
    clearError("email");
    if (!card.classList.contains('login-error')) {
      clearLoginStates();
    }
  });

  passwordInput.addEventListener("input", () => {
    clearError("password");
    if (!card.classList.contains('login-error')) {
      clearLoginStates();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearLoginStates();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const remember = document.getElementById("remember").checked;

    let isValid = true;

    const emailError = validateEmail(email);
    if (emailError) {
      showError("email", emailError);
      emailInput.focus();
      isValid = false;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      showError("password", passwordError);
      if (isValid) passwordInput.focus();
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.message || `Erro ${response.status}`;
        throw new Error(errorMsg);
      }

      if (data.data && data.data.token) {
        localStorage.setItem('auth_token', data.data.token);
        
        if (data.data.roles) {
          localStorage.setItem('user_roles', JSON.stringify(data.data.roles));
        }
        
        if (remember) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }
        
        showLoginSuccess();
        
      } else if (data.token) {
        localStorage.setItem('auth_token', data.token);
        
        if (remember) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }
        
        showLoginSuccess();
        
      } else {
        throw new Error("Token não encontrado na resposta");
      }

    } catch (err) {
      console.error("Erro no login:", err.message);
      
      let errorMessage = "E-mail ou senha incorretos";
      
      const errMsg = err.message.toLowerCase();
      
      if (errMsg.includes("invalid") || errMsg.includes("credenciais") || errMsg.includes("401")) {
        errorMessage = "E-mail ou senha incorretos";
      } else if (errMsg.includes("not found") || errMsg.includes("404")) {
        errorMessage = "Usuário não encontrado";
      } else if (errMsg.includes("inactive") || errMsg.includes("inativo")) {
        errorMessage = "Conta inativa";
      } else if (errMsg.includes("locked") || errMsg.includes("bloqueada")) {
        errorMessage = "Conta bloqueada";
      } else if (errMsg.includes("timeout") || errMsg.includes("network")) {
        errorMessage = "Problema de conexão";
      } else if (errMsg.includes("500")) {
        errorMessage = "Erro no servidor";
      } else if (errMsg.includes("400")) {
        errorMessage = "Dados inválidos";
      } else if (errMsg.includes("token")) {
        errorMessage = "Erro de autenticação";
      }
      
      showLoginError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      emailInput.value = rememberedEmail;
      document.getElementById("remember").checked = true;
      passwordInput.focus();
    }
  });

  window.addEventListener("pageshow", () => {
    clearLoginStates();
  });
})();