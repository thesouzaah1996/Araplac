(() => {
  const API_URL = "http://localhost:8090/api/auth/reset-password";
  const form = document.getElementById("resetForm");
  const codeInput = document.getElementById("code");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const submitBtn = document.getElementById("submitBtn");
  const topProgress = document.getElementById("topProgress");

  const errors = {
    code: document.getElementById("codeErr"),
    password: document.getElementById("passwordErr"),
    confirm: document.getElementById("confirmErr")
  };

  const style = document.createElement('style');
  style.textContent = `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      opacity: 0;
      animation: fadeIn 0.3s ease forwards;
      backdrop-filter: blur(4px);
    }
    
    .modal-content {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      transform: translateY(30px);
      animation: slideUp 0.4s ease 0.1s forwards;
    }
    
    .modal-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: bold;
    }
    
    .modal-success .modal-icon {
      background: linear-gradient(135deg, #10b981, #34d399);
      color: white;
    }
    
    .modal-error .modal-icon {
      background: linear-gradient(135deg, #ef4444, #f97316);
      color: white;
    }
    
    .modal-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 12px;
      color: #1f2937;
    }
    
    .modal-message {
      color: #6b7280;
      line-height: 1.5;
      margin-bottom: 24px;
      font-size: 15px;
    }
    
    .modal-tips {
      background: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      margin: 20px 0;
      text-align: left;
      border-left: 4px solid #ef4444;
    }
    
    .modal-tips-title {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .modal-tips-list {
      margin: 0;
      padding-left: 20px;
      color: #6b7280;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .modal-tips-list li {
      margin-bottom: 6px;
    }
    
    .modal-button {
      background: linear-gradient(90deg, #7d0000, #b60000);
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 140px;
    }
    
    .modal-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(125, 0, 0, 0.25);
      filter: brightness(1.1);
    }
    
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 20px;
    }
    
    .modal-button-secondary {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }
    
    .modal-button-secondary:hover {
      background: #e2e8f0;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    @keyframes fadeIn {
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      to { transform: translateY(0); }
    }
    
    @keyframes scaleIn {
      0% { transform: scale(0); }
      70% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    .success-check {
      animation: scaleIn 0.5s ease;
    }
    
    .error-exclamation {
      animation: scaleIn 0.5s ease;
    }
  `;
  document.head.appendChild(style);

  function createModal(type, title, message, tips = null, showSecondaryButton = false, secondaryAction = null) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const icon = type === 'success' ? '✓' : '!';
    const iconClass = type === 'success' ? 'success-check' : 'error-exclamation';
    
    let tipsHtml = '';
    if (tips) {
      tipsHtml = `
        <div class="modal-tips">
          <div class="modal-tips-title">O que fazer:</div>
          <ul class="modal-tips-list">
            ${tips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    let buttonsHtml = '';
    if (showSecondaryButton && secondaryAction) {
      buttonsHtml = `
        <div class="modal-actions">
          <button class="modal-button" onclick="this.closest('.modal-overlay').remove()">
            ${type === 'success' ? 'Continuar' : 'Tentar Novamente'}
          </button>
          <button class="modal-button modal-button-secondary" onclick="${secondaryAction}">
            Solicitar Novo Código
          </button>
        </div>
      `;
    } else {
      buttonsHtml = `
        <button class="modal-button" onclick="this.closest('.modal-overlay').remove()">
          ${type === 'success' ? 'Continuar' : 'Entendido'}
        </button>
      `;
    }
    
    overlay.innerHTML = `
      <div class="modal-content modal-${type}">
        <div class="modal-icon ${iconClass}">${icon}</div>
        <h3 class="modal-title">${title}</h3>
        <p class="modal-message">${message}</p>
        ${tipsHtml}
        ${buttonsHtml}
      </div>
    `;
    
    return overlay;
  }

  function showModal(type, title, message, tips = null, showSecondaryButton = false, secondaryAction = null) {
    const modal = createModal(type, title, message, tips, showSecondaryButton, secondaryAction);
    document.body.appendChild(modal);
    
    if (type === 'success') {
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
          window.location.href = "login.html";
        }
      }, 30000);
    }
    
    return modal;
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
    const input = document.getElementById(field === "confirm" ? "confirmPassword" : field);
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
  }

  function clearError(field) {
    errors[field].textContent = "";
    errors[field].hidden = true;
    const input = document.getElementById(field === "confirm" ? "confirmPassword" : field);
    input.classList.remove("is-invalid");
  }

  function clearAllErrors() {
    Object.keys(errors).forEach(clearError);
  }

  function validateCode(code) {
    if (!code) return "Código é obrigatório";
    if (code.length !== 6) return "Código deve ter 6 caracteres";
    return "";
  }

  function validatePassword(password) {
    if (!password) return "Senha é obrigatória";
    if (password.length < 6) return "Senha deve ter no mínimo 6 caracteres";
    return "";
  }

  function validateConfirm(password, confirm) {
    if (!confirm) return "Confirmação é obrigatória";
    if (password !== confirm) return "As senhas não coincidem";
    return "";
  }

  function requestNewCode() {
    const email = localStorage.getItem('recovery_email') || sessionStorage.getItem('recovery_email');
    if (!email) {
      showModal('error', 'E-mail Não Encontrado', 
        'Não foi possível identificar seu e-mail. Volte à página anterior e solicite um novo código.',
        [
          'Volte para a página de recuperação de senha',
          'Digite novamente seu e-mail',
          'Clique em "Enviar novo código"'
        ]
      );
      return;
    }

    showModal('success', 'Novo Código Solicitado', 
      'Enviamos um novo código para seu e-mail. Verifique sua caixa de entrada.',
      [
        'O código pode levar alguns minutos para chegar',
        'Verifique também a pasta de spam',
        'O código é válido por 15 minutos'
      ]
    );
    
    setTimeout(() => {
      window.location.href = "forgot-password.html";
    }, 2000);
  }

  document.getElementById("togglePwd1").addEventListener("click", function() {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    this.setAttribute("aria-pressed", isPassword);
  });

  document.getElementById("togglePwd2").addEventListener("click", function() {
    const isPassword = confirmInput.type === "password";
    confirmInput.type = isPassword ? "text" : "password";
    this.setAttribute("aria-pressed", isPassword);
  });

  codeInput.addEventListener("input", function() {
    let value = this.value;
    if (value.length > 6) {
      value = value.slice(0, 6);
      this.value = value;
    }
    
    clearError("code");
    
    if (value.length === 6) {
      passwordInput.focus();
    }
  });

  codeInput.addEventListener("paste", function(e) {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const cleanText = pastedText.replace(/\s/g, '').slice(0, 6);
    this.value = cleanText;
    
    if (cleanText.length === 6) {
      passwordInput.focus();
    }
    
    clearError("code");
  });

  passwordInput.addEventListener("input", () => {
    clearError("password");
    clearError("confirm");
  });

  confirmInput.addEventListener("input", () => {
    clearError("confirm");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllErrors();

    const code = codeInput.value.trim();
    const newPassword = passwordInput.value;
    const confirm = confirmInput.value;

    let isValid = true;

    const codeError = validateCode(code);
    if (codeError) {
      showError("code", codeError);
      codeInput.focus();
      isValid = false;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showError("password", passwordError);
      if (isValid) passwordInput.focus();
      isValid = false;
    }

    const confirmError = validateConfirm(newPassword, confirm);
    if (confirmError) {
      showError("confirm", confirmError);
      if (isValid) confirmInput.focus();
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
          code: code,
          newPassword: newPassword 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.message || `Erro ${response.status}`;
        throw new Error(errorMsg);
      }

      showModal(
        'success', 
        'Senha Redefinida!', 
        'Sua senha foi alterada com sucesso. Você será redirecionado para a página de login.',
        [
          'Faça login com sua nova senha',
          'Guarde sua senha em local seguro',
          'Evite usar senhas muito simples'
        ]
      );

    } catch (err) {
      console.error("Erro ao redefinir senha:", err.message);
      
      let errorTitle = "Não foi possível redefinir";
      let errorMessage = "";
      let tips = [];
      let showSecondary = false;
      
      const errMsg = err.message.toLowerCase();
      
      if (errMsg.includes("invalid") || errMsg.includes("inválido") || errMsg.includes("401") || errMsg.includes("404")) {
        errorTitle = "Código Incorreto";
        errorMessage = "O código de verificação está incorreto ou já foi utilizado.";
        tips = [
          'Verifique se digitou o código corretamente',
          'O código é sensível a maiúsculas/minúsculas',
          'Cada código só pode ser usado uma vez'
        ];
        showSecondary = true;
        showError("code", "Código inválido");
        
      } else if (errMsg.includes("expired") || errMsg.includes("expirado") || errMsg.includes("419")) {
        errorTitle = "Código Expirado";
        errorMessage = "Este código de verificação já expirou. Os códigos são válidos por 15 minutos.";
        tips = [
          'Solicite um novo código de verificação',
          'Verifique seu e-mail imediatamente após recebê-lo',
          'O relógio do sistema deve estar sincronizado'
        ];
        showSecondary = true;
        showError("code", "Código expirado");
        
      } else if (errMsg.includes("weak") || errMsg.includes("fraca") || errMsg.includes("senha")) {
        errorTitle = "Senha Muito Fraca";
        errorMessage = "A senha escolhida não atende aos requisitos de segurança.";
        tips = [
          'Use pelo menos 8 caracteres',
          'Combine letras, números e símbolos',
          'Evite sequências óbvias como "123456"',
          'Não use informações pessoais'
        ];
        showError("password", "Senha muito fraca");
        
      } else if (errMsg.includes("timeout") || errMsg.includes("tempo") || errMsg.includes("network")) {
        errorTitle = "Problema de Conexão";
        errorMessage = "A conexão com o servidor foi interrompida ou está muito lenta.";
        tips = [
          'Verifique sua conexão com a internet',
          'Tente novamente em alguns instantes',
          'Desative VPNs ou firewalls temporariamente'
        ];
        
      } else if (errMsg.includes("500") || errMsg.includes("internal")) {
        errorTitle = "Erro no Sistema";
        errorMessage = "Estamos com problemas técnicos no momento. Nossa equipe já foi notificada.";
        tips = [
          'Tente novamente em 5-10 minutos',
          'Se o problema persistir, entre em contato com o suporte',
          'Mantenha seu código de verificação seguro'
        ];
        
      } else if (errMsg.includes("400") || errMsg.includes("bad request")) {
        errorTitle = "Dados Incorretos";
        errorMessage = "Alguma informação enviada não está no formato correto.";
        tips = [
          'Verifique se o código tem exatamente 6 caracteres',
          'A senha precisa ter pelo menos 6 caracteres',
          'As senhas devem ser iguais nos dois campos'
        ];
        
      } else {
        errorTitle = "Erro Inesperado";
        errorMessage = "Algo inesperado aconteceu. Por favor, tente novamente.";
        tips = [
          'Recarregue a página e tente novamente',
          'Limpe o cache do navegador',
          'Tente em outro navegador'
        ];
      }
      
      showModal('error', errorTitle, errorMessage, tips, showSecondary, 'requestNewCode()');
      
    } finally {
      setLoading(false);
    }
  });

  window.addEventListener("pageshow", () => {
    clearAllErrors();
    form.reset();
  });
})();