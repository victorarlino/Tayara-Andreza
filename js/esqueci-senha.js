const recoveryForm = document.getElementById('recoveryForm');
const email = document.getElementById('email');
const confirmEmail = document.getElementById('confirmEmail');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const message = document.getElementById('recoveryMessage');
const passwordFields = document.getElementById('passwordFields');
const recoveryIntro = document.getElementById('recoveryIntro');
const recoverySubmitBtn = document.getElementById('recoverySubmitBtn');

const SUPABASE_URL = 'https://myyrzxvycljhcubyjaal.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2EfqfV5GqNDtejVD5KF5sQ_fwuyxhL-';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getApiBaseUrl() {
    const { hostname, port, protocol, origin } = window.location;
    const configuredBaseUrl = String(window.APP_CONFIG?.API_BASE_URL || '').trim();
    const isLocalhost = hostname === '127.0.0.1' || hostname === 'localhost';

    if (configuredBaseUrl) {
        return configuredBaseUrl.replace(/\/$/, '');
    }

    if (isLocalhost && port !== '3000') {
        return `${protocol}//${hostname}:3000`;
    }

    if (protocol.startsWith('http')) {
        return origin;
    }

    return 'http://localhost:3000';
}

const API_BASE_URL = getApiBaseUrl();
const isRecoveryAccess = window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token=');

function setRecoveryMode(isRecoveryMode) {
    passwordFields.hidden = !isRecoveryMode;
    newPassword.required = isRecoveryMode;
    confirmPassword.required = isRecoveryMode;
    email.disabled = isRecoveryMode;
    confirmEmail.disabled = isRecoveryMode;

    if (isRecoveryMode) {
        recoveryIntro.textContent = 'Defina sua nova senha para concluir a recuperação.';
        recoverySubmitBtn.textContent = 'Salvar nova senha';
    } else {
        recoveryIntro.textContent = 'Informe seu e-mail para receber o link de recuperação de senha.';
        recoverySubmitBtn.textContent = 'Enviar link de recuperação';
    }
}

async function sendRecoveryEmail() {
    if (email.value.trim().toLowerCase() !== confirmEmail.value.trim().toLowerCase()) {
        message.textContent = 'Os e-mails não conferem.';
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
                redirectTo: `${window.location.origin}/esqueci-senha.html`
            })
        });

        const result = await response.json();

        if (!response.ok) {
            message.textContent = result.message || 'Não foi possível enviar o e-mail de recuperação.';
            message.classList.add('error');
            return;
        }

        message.textContent = 'Enviamos um link de recuperação para o e-mail informado.';
        message.classList.add('success');
        recoveryForm.reset();
    } catch (error) {
        message.textContent = 'Erro de conexão com o servidor. Tente novamente.';
        message.classList.add('error');
    }
}

async function updateRecoveredPassword() {
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
        const { error } = await supabaseClient.auth.updateUser({
            password: newPassword.value
        });

        if (error) {
            message.textContent = error.message || 'Não foi possível alterar a senha.';
            message.classList.add('error');
            return;
        }

        message.textContent = 'Senha alterada com sucesso! Agora você já pode fazer login.';
        message.classList.add('success');
        recoveryForm.reset();
        window.history.replaceState({}, document.title, window.location.pathname);
        setRecoveryMode(false);
        await supabaseClient.auth.signOut();
    } catch (error) {
        message.textContent = 'Erro ao concluir a recuperação da senha.';
        message.classList.add('error');
    }
}

if (recoveryForm) {
    recoveryForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        message.textContent = '';
        message.className = 'recovery-message';

        if (passwordFields.hidden) {
            await sendRecoveryEmail();
            return;
        }

        await updateRecoveredPassword();
    });
}

setRecoveryMode(isRecoveryAccess);
