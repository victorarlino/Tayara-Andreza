const recoveryForm = document.getElementById('recoveryForm');
const email = document.getElementById('email');
const confirmEmail = document.getElementById('confirmEmail');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const message = document.getElementById('recoveryMessage');

function getApiBaseUrl() {
    const { hostname, port, protocol, origin } = window.location;

    if ((hostname === '127.0.0.1' || hostname === 'localhost') && port === '5500') {
        return 'http://localhost:3000';
    }

    if (protocol.startsWith('http')) {
        return origin;
    }

    return 'http://localhost:3000';
}

const API_BASE_URL = getApiBaseUrl();

if (recoveryForm) {
    recoveryForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        message.textContent = '';
        message.className = 'recovery-message';

        if (email.value.trim().toLowerCase() !== confirmEmail.value.trim().toLowerCase()) {
            message.textContent = 'Os e-mails não conferem.';
            message.classList.add('error');
            return;
        }

        if (newPassword.value !== confirmPassword.value) {
            message.textContent = 'As senhas não conferem.';
            message.classList.add('error');
            return;
        }

        if (newPassword.value.length < 6) {
            message.textContent = 'A nova senha deve ter pelo menos 6 caracteres.';
            message.classList.add('error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.value.trim(),
                    confirmarEmail: confirmEmail.value.trim(),
                    novaSenha: newPassword.value,
                    confirmarNovaSenha: confirmPassword.value
                })
            });

            const result = await response.json();

            if (!response.ok) {
                message.textContent = result.message || 'Não foi possível alterar a senha.';
                message.classList.add('error');
                return;
            }

            message.textContent = 'Senha alterada com sucesso!';
            message.classList.add('success');
            recoveryForm.reset();
        } catch (error) {
            message.textContent = 'Erro de conexão com o servidor. Tente novamente.';
            message.classList.add('error');
        }
    });
}
