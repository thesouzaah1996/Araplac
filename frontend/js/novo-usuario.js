document.addEventListener('DOMContentLoaded', function() {
    const toggleSenha = document.getElementById('toggleSenha');
    const toggleConfirmarSenha = document.getElementById('toggleConfirmarSenha');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    
    if (toggleSenha && senhaInput) {
        toggleSenha.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (senhaInput.type === 'password') {
                senhaInput.type = 'text';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                senhaInput.type = 'password';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        });
    }
    
    if (toggleConfirmarSenha && confirmarSenhaInput) {
        toggleConfirmarSenha.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (confirmarSenhaInput.type === 'password') {
                confirmarSenhaInput.type = 'text';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                confirmarSenhaInput.type = 'password';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        });
    }
    
    const form = document.getElementById('novoUsuarioForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                submitBtn.disabled = true;
                submitBtn.querySelector('.btn-label').classList.add('d-none');
                submitBtn.querySelector('.spinner-border').classList.remove('d-none');
                
                try {
                    const responseData = await registerUser();
                    
                    console.log('Dados da resposta:', responseData);
                    
                    const email = document.getElementById('email').value.trim();
                    showSuccessModal(`Usuário criado com sucesso! Um e-mail de boas-vindas foi enviado para <strong>${email}</strong> com as instruções de acesso.`);
                    
                } catch (error) {
                    console.error('Erro na requisição:', error);
                    showErrorModal(error.message || 'Erro ao criar usuário');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.querySelector('.btn-label').classList.remove('d-none');
                    submitBtn.querySelector('.spinner-border').classList.add('d-none');
                }
            }
        });
    }
    
    async function registerUser() {
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;
        const rolesSelect = document.getElementById('roles');
        
        const roles = [];
        if (rolesSelect.value) {
            roles.push(rolesSelect.value);
        } else {
            roles.push('AUXILIAR');
        }
        
        const userData = {
            name: nome,
            email: email,
            password: senha,
            roles: roles
        };
        
        console.log('Enviando dados:', userData);
        
        const response = await fetch('http://localhost:8090/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const responseText = await response.text();
        console.log('Resposta completa:', responseText);
        
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('Não é JSON válido:', responseText);
            throw new Error('Por favor, confira se os dados estão corretos.');
        }
        
        console.log('Resposta parseada:', responseData);
        
        if (response.ok) {
            return responseData;
        } else {
            const errorMsg = responseData.message || responseData.error || `Erro HTTP ${response.status}`;
            throw new Error(errorMsg);
        }
    }
    
    function validateForm() {
        let isValid = true;
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        
        if (!nome) {
            showError('nomeError', 'Nome é obrigatório');
            isValid = false;
        } else {
            hideError('nomeError');
        }
        
        const emailField = document.getElementById('email');
        if (!email) {
            showError('emailError', 'E-mail é obrigatório');
            emailField.classList.add('is-invalid');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('emailError', 'E-mail inválido. Use o formato: usuario@empresa.com');
            emailField.classList.add('is-invalid');
            isValid = false;
        } else {
            hideError('emailError');
            emailField.classList.remove('is-invalid');
        }
        
        if (!senha || senha.length < 6) {
            showError('senhaError', 'Senha deve ter no mínimo 6 caracteres');
            isValid = false;
        } else {
            hideError('senhaError');
        }
        
        if (!confirmarSenha || senha !== confirmarSenha) {
            showError('confirmarSenhaError', 'As senhas não coincidem');
            isValid = false;
        } else {
            hideError('confirmarSenhaError');
        }
        
        return isValid;
    }
    
    function showError(id, message) {
        const errorElement = document.getElementById(id);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    function hideError(id) {
        const errorElement = document.getElementById(id);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
    
    function performLogout() {
        window.location.href = 'login.html';
    }
    
    function showSuccessModal(message) {
        const modalHtml = `
            <div class="modal fade" id="successModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header border-0">
                            <div class="modal-icon" style="background: rgba(25, 135, 84, 0.1); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <i class="bi bi-check-circle-fill text-success" style="font-size: 24px;"></i>
                            </div>
                            <h5 class="modal-title ms-2">Sucesso!</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body py-4">
                            <p class="mb-0">${message}</p>
                            <p class="mb-0 mt-2 text-muted">O e-mail contém as credenciais de acesso e instruções para o primeiro login.</p>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-success" data-bs-dismiss="modal">
                                <i class="bi bi-check-circle me-2"></i>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
        
        document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    function showErrorModal(message) {
        const modalHtml = `
            <div class="modal fade" id="errorModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header border-0">
                            <div class="modal-icon" style="background: rgba(220, 53, 69, 0.1); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <i class="bi bi-exclamation-circle-fill text-danger" style="font-size: 24px;"></i>
                            </div>
                            <h5 class="modal-title ms-2">Erro</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body py-4">
                            <p class="mb-0">${message}</p>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-danger" data-bs-dismiss="modal">
                                <i class="bi bi-x-circle me-2"></i>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        const modal = new bootstrap.Modal(document.getElementById('errorModal'));
        modal.show();
        
        document.getElementById('errorModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    window.performLogout = performLogout;
});