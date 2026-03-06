const loginForm = document.getElementById('loginForm');
const loginEmailInput = document.getElementById('email');
const loginPasswordInput = document.getElementById('senha');
const CURRENT_USER_KEY_STORAGE = 'fanClubCurrentUserKey';
const CURRENT_USER_ACCESS_TOKEN_KEY = 'fanClubCurrentUserAccessToken';
const ADMIN_CONSULTA_EMAIL = 'victorduartearlino2210@gmail.com';

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

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: loginEmailInput.value.trim(),
                    senha: loginPasswordInput.value
                })
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || 'Não foi possível realizar login.');
                return;
            }

            const nomeUsuario = (result.user?.nome || '').trim();
            const emailValue = loginEmailInput.value.trim().toLowerCase();
            const fallbackName = emailValue.includes('@') ? emailValue.split('@')[0] : 'fã';
            const userKey = emailValue;

            localStorage.setItem(CURRENT_USER_KEY_STORAGE, userKey);
            localStorage.setItem(`fanClubUserName:${userKey}`, nomeUsuario || fallbackName);

            if (result.session?.accessToken) {
                localStorage.setItem(CURRENT_USER_ACCESS_TOKEN_KEY, result.session.accessToken);
            } else {
                localStorage.removeItem(CURRENT_USER_ACCESS_TOKEN_KEY);
            }

            if (emailValue === ADMIN_CONSULTA_EMAIL) {
                window.location.href = 'consulta-pessoas.html';
                return;
            }

            window.location.href = 'fa-clube.html';
        } catch (error) {
            alert('Erro de conexão com o servidor. Tente novamente.');
        }
    });
}