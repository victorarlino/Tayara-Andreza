const loginForm = document.getElementById('loginForm');
const loginEmailInput = document.getElementById('email');
const loginPasswordInput = document.getElementById('senha');
const CURRENT_USER_KEY_STORAGE = 'fanClubCurrentUserKey';
const CURRENT_USER_ACCESS_TOKEN_KEY = 'fanClubCurrentUserAccessToken';
const ADMIN_CONSULTA_EMAIL = 'victorduartearlino2210@gmail.com';

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

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const emailValue = loginEmailInput.value.trim().toLowerCase();
            const senhaValue = loginPasswordInput.value;

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: emailValue,
                password: senhaValue
            });

            if (error || !data.user) {
                alert('E-mail ou senha inválidos.');
                return;
            }

            const nomeUsuario = (data.user.user_metadata?.nome || '').trim();
            const fallbackName = emailValue.includes('@') ? emailValue.split('@')[0] : 'fã';
            const userKey = emailValue;

            localStorage.setItem(CURRENT_USER_KEY_STORAGE, userKey);
            localStorage.setItem(`fanClubUserName:${userKey}`, nomeUsuario || fallbackName);

            if (data.session?.access_token) {
                localStorage.setItem(CURRENT_USER_ACCESS_TOKEN_KEY, data.session.access_token);
            } else {
                localStorage.removeItem(CURRENT_USER_ACCESS_TOKEN_KEY);
            }

            if (emailValue === ADMIN_CONSULTA_EMAIL) {
                window.location.href = 'consulta-pessoas.html';
                return;
            }

            window.location.href = 'fa-clube.html';
        } catch (error) {
            alert('Erro de conexão. Tente novamente.');
        }
    });
}