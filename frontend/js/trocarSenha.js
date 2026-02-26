(() => {
  const API_URL = "http://localhost:8090/api/auth/forgot-password";
  const form = document.getElementById("forgotForm");
  const emailInput = document.getElementById("email");
  const emailErr = document.getElementById("emailErr");
  const sendBtn = document.getElementById("sendBtn");

  let successOverlay, errorOverlay;
  let timeoutId = null;

  const style = document.createElement('style');
  style.textContent = `
    .feedback-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.85);
      z-index: 1000;
      opacity: 0;
      animation: fadeIn 0.3s ease forwards;
    }
    
    .feedback-content {
      background: white;
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      transform: translateY(20px);
      animation: slideUp 0.4s ease 0.2s forwards;
    }
    
    .success-icon {
      width: 100px;
      height: 100px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #4CAF50, #8BC34A);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: scaleIn 0.5s ease;
    }
    
    .success-icon::after {
      content: "✓";
      font-size: 48px;
      color: white;
      font-weight: bold;
    }
    
    .error-icon {
      width: 100px;
      height: 100px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #F44336, #FF9800);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: shake 0.5s ease;
    }
    
    .error-icon::after {
      content: "!";
      font-size: 48px;
      color: white;
      font-weight: bold;
    }
    
    .feedback-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #333;
    }
    
    .feedback-message {
      color: #666;
      margin-bottom: 25px;
      line-height: 1.5;
    }
    
    .feedback-button {
      background: #2c3e50;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .feedback-button:hover {
      background: #34495e;
      transform: translateY(-2px);
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
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
    
    .button-loading {
      position: relative;
      color: transparent !important;
    }
    
    .button-loading::after {
      content: "";
      position: absolute;
      width: 20px;
      height: 20px;
      top: 50%;
      left: 50%;
      margin-left: -10px;
      margin-top: -10px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #2c3e50;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  function createSuccessOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'feedback-overlay';
    overlay.innerHTML = `
      <div class="feedback-content">
        <div class="success-icon"></div>
        <h2 class="feedback-title">E-mail Enviado!</h2>
        <p class="feedback-message">
          Um link de recuperação foi enviado para seu e-mail.<br>
          Verifique sua caixa de entrada e também a pasta de spam.
        </p>
        <button class="feedback-button" onclick="this.closest('.feedback-overlay').remove()">
          Voltar
        </button>
      </div>
    `;
    return overlay;
  }

  function createErrorOverlay(message) {
    const overlay = document.createElement('div');
    overlay.className = 'feedback-overlay';
    overlay.innerHTML = `
      <div class="feedback-content">
        <div class="error-icon"></div>
        <h2 class="feedback-title">Erro no Envio</h2>
        <p class="feedback-message">${message}</p>
        <button class="feedback-button" onclick="this.closest('.feedback-overlay').remove()">
          Tentar Novamente
        </button>
      </div>
    `;
    return overlay;
  }

  function setLoading(state) {
    sendBtn.disabled = state;
    if (state) {
      sendBtn.classList.add('button-loading');
      sendBtn.textContent = "Enviando...";
    } else {
      sendBtn.classList.remove('button-loading');
      sendBtn.textContent = "Enviar e-mail";
    }
  }

  function showError(msg) {
    emailErr.textContent = msg;
    emailErr.style.color = '#F44336';
    emailErr.hidden = false;
    emailInput.style.borderColor = '#F44336';
  }

  function clearError() {
    emailErr.textContent = "";
    emailErr.hidden = true;
    emailInput.style.borderColor = '';
  }

  function fetchWithTimeout(url, options, timeout = 8000) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Tempo de conexão excedido")), timeout)
      )
    ]);
  }

  async function sendRequest(email) {
    const controller = new AbortController();
    
    const response = await fetchWithTimeout(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email }),
      signal: controller.signal
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || `Erro ${response.status}`);
    }

    return response.json();
  }

  emailInput.addEventListener('blur', () => {
    const email = emailInput.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Por favor, insira um e-mail válido");
    } else {
      clearError();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const email = emailInput.value.trim();
    
    if (!email) {
      showError("Informe seu e-mail.");
      emailInput.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Por favor, insira um e-mail válido");
      emailInput.focus();
      return;
    }

    setLoading(true);

    try {
      await sendRequest(email);
      
      successOverlay = createSuccessOverlay();
      document.body.appendChild(successOverlay);
      
      setTimeout(() => {
        if (successOverlay && successOverlay.parentNode) {
          successOverlay.remove();
        }
        form.reset();
      }, 3000);
      
    } catch (err) {
      let errorMessage;
      if (err.message.includes('404')) {
        errorMessage = "Serviço não encontrado. Verifique a conexão.";
      } else if (err.message.includes('Tempo')) {
        errorMessage = "A conexão está demorando muito. Tente novamente.";
      } else if (err.message.includes('500')) {
        errorMessage = "Erro interno do servidor. Tente mais tarde.";
      } else {
        errorMessage = "Erro ao enviar e-mail. Verifique o endereço.";
      }
      
      errorOverlay = createErrorOverlay(errorMessage);
      document.body.appendChild(errorOverlay);
      showError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  });

  emailInput.addEventListener('input', () => {
    if (emailInput.value.trim()) {
      clearError();
    }
  });

  window.addEventListener('beforeunload', () => {
    if (timeoutId) clearTimeout(timeoutId);
  });
})();