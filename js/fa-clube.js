const userNameElement = document.getElementById('fanclubUserName');
const userPhotoElement = document.getElementById('fanclubUserPhoto');
const avatarPlaceholder = document.getElementById('avatarPlaceholder');
const avatarToggle = document.getElementById('avatarToggle');
const fanclubMenu = document.getElementById('fanclubMenu');
const profileMenuLink = document.querySelector('.fanclub-menu-item[href="perfil.html"]');
const logoutButton = document.getElementById('logoutButton');
const fanclubSearchInput = document.getElementById('fanclubSearchInput');
const fanclubSearchResults = document.getElementById('fanclubSearchResults');
const defaultUserName = 'fã';
const CURRENT_USER_KEY_STORAGE = 'fanClubCurrentUserKey';
const CURRENT_USER_ACCESS_TOKEN_KEY = 'fanClubCurrentUserAccessToken';
let searchDebounceTimer = null;

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

function getCurrentUserKey() {
    return localStorage.getItem(CURRENT_USER_KEY_STORAGE) || 'guest';
}

function readScopedValue(baseKey) {
    const currentUserKey = getCurrentUserKey();
    return localStorage.getItem(`${baseKey}:${currentUserKey}`);
}

function renderUserHeader() {
    const savedUserName = readScopedValue('fanClubUserName') || defaultUserName;
    const savedUserPhoto = readScopedValue('fanClubUserPhoto');

    if (userNameElement) {
        userNameElement.textContent = `Olá, ${savedUserName}!`;
    }

    if (userPhotoElement) {
        userPhotoElement.alt = `Foto de ${savedUserName}`;

        if (savedUserPhoto) {
            userPhotoElement.src = savedUserPhoto;
            userPhotoElement.hidden = false;

            if (avatarPlaceholder) {
                avatarPlaceholder.hidden = true;
            }
        } else {
            userPhotoElement.hidden = true;

            if (avatarPlaceholder) {
                avatarPlaceholder.hidden = false;
                avatarPlaceholder.textContent = savedUserName.trim().charAt(0).toUpperCase() || '+';
            }
        }
    }
}

renderUserHeader();

if (profileMenuLink) {
    const currentUserKey = getCurrentUserKey();
    profileMenuLink.href = `perfil.html?user=${encodeURIComponent(currentUserKey)}`;
}

if (avatarToggle && fanclubMenu) {
    avatarToggle.addEventListener('click', () => {
        const isMenuHidden = fanclubMenu.hidden;
        fanclubMenu.hidden = !isMenuHidden;
        avatarToggle.setAttribute('aria-expanded', String(isMenuHidden));
    });
}

document.addEventListener('click', (event) => {
    if (!fanclubMenu || !avatarToggle) {
        return;
    }

    const clickedInsideUser = event.target instanceof Element && event.target.closest('.fanclub-user');

    if (!clickedInsideUser) {
        fanclubMenu.hidden = true;
        avatarToggle.setAttribute('aria-expanded', 'false');
    }
});

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem(CURRENT_USER_KEY_STORAGE);
        localStorage.removeItem(CURRENT_USER_ACCESS_TOKEN_KEY);
        window.location.href = 'index.html';
    });
}

function closeSearchResults() {
    if (!fanclubSearchResults) {
        return;
    }

    fanclubSearchResults.hidden = true;
    fanclubSearchResults.innerHTML = '';
}

function renderSearchResults(searchItems) {
    if (!fanclubSearchResults) {
        return;
    }

    if (!Array.isArray(searchItems) || !searchItems.length) {
        fanclubSearchResults.innerHTML = '<div class="fanclub-search-result-empty">Nenhum cadastro encontrado.</div>';
        fanclubSearchResults.hidden = false;
        return;
    }

    const resultsHtml = searchItems
        .map((item) => {
            const nome = escapeHtml(String(item?.nome || 'Nome não informado'));
            const cidadeEstado = [item?.cidade, item?.estado].filter(Boolean).join(' - ');
            const email = String(item?.email || 'E-mail não informado');
            const meta = escapeHtml(cidadeEstado ? `${cidadeEstado} | ${email}` : email);
            const tipo = escapeHtml(String(item?.tipoLabel || 'Cadastro'));
            const profileHref = buildProfileHref(item?.email);
            const safeHref = escapeHtml(profileHref);

            return `
                <div class="fanclub-search-result-item" data-profile-href="${safeHref}" role="link" tabindex="0" aria-label="Abrir perfil de ${nome}">
                    <span class="fanclub-search-result-type">${tipo}</span>
                    <a class="fanclub-search-result-name" href="${safeHref}">${nome}</a>
                    <span class="fanclub-search-result-meta">${meta}</span>
                </div>
            `;
        })
        .join('');

    fanclubSearchResults.innerHTML = resultsHtml;
    fanclubSearchResults.hidden = false;
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function buildProfileHref(email) {
    const userKey = String(email || '').trim().toLowerCase();

    if (!userKey) {
        return 'perfil.html';
    }

    return `perfil.html?user=${encodeURIComponent(userKey)}`;
}

async function fetchPessoasBySearchTerm(searchTerm) {
    const params = new URLSearchParams();
    params.set('nome', searchTerm);
    params.set('limit', '8');

    const response = await fetch(`${API_BASE_URL}/api/cadastros/pessoas?${params.toString()}`, {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error('Falha ao buscar cadastros.');
    }

    const payload = await response.json();
    const pessoas = Array.isArray(payload?.pessoas) ? payload.pessoas : [];

    return pessoas.map((pessoa) => ({
        tipo: 'pessoa',
        tipoLabel: 'Pessoa',
        nome: pessoa?.nome,
        email: pessoa?.email,
        cidade: pessoa?.cidade,
        estado: pessoa?.estado,
        created_at: pessoa?.created_at || null
    }));
}

function getSearchRequestHeaders() {
    const accessToken = String(localStorage.getItem(CURRENT_USER_ACCESS_TOKEN_KEY) || '').trim();

    if (!accessToken) {
        return {};
    }

    return {
        Authorization: `Bearer ${accessToken}`
    };
}

async function fetchFanClubesBySearchTerm(searchTerm) {
    const params = new URLSearchParams();
    params.set('nome', searchTerm);
    params.set('limit', '6');

    const response = await fetch(`${API_BASE_URL}/api/cadastros/fan-clubes?${params.toString()}`, {
        method: 'GET',
        headers: getSearchRequestHeaders()
    });

    if (!response.ok) {
        throw new Error('Falha ao buscar fã-clubes.');
    }

    const payload = await response.json();
    const fanClubes = Array.isArray(payload?.fanClubes) ? payload.fanClubes : [];

    return fanClubes.map((fanClube) => ({
        tipo: 'fan-clube',
        tipoLabel: 'Fã-clube',
        nome: fanClube?.nome,
        email: fanClube?.email,
        cidade: fanClube?.cidade,
        estado: fanClube?.estado,
        created_at: fanClube?.created_at || null
    }));
}

function sortByRecent(items) {
    return [...items].sort((a, b) => {
        const dateA = new Date(a?.created_at || 0).getTime();
        const dateB = new Date(b?.created_at || 0).getTime();
        return dateB - dateA;
    });
}

async function fetchSearchResults(searchTerm) {
    const [pessoasResult, fanClubesResult] = await Promise.allSettled([
        fetchPessoasBySearchTerm(searchTerm),
        fetchFanClubesBySearchTerm(searchTerm)
    ]);

    const pessoas = pessoasResult.status === 'fulfilled' ? pessoasResult.value : [];
    const fanClubes = fanClubesResult.status === 'fulfilled' ? fanClubesResult.value : [];

    return sortByRecent([...pessoas, ...fanClubes]).slice(0, 10);
}

if (fanclubSearchInput && fanclubSearchResults) {
    fanclubSearchInput.addEventListener('input', () => {
        const searchTerm = String(fanclubSearchInput.value || '').trim();

        window.clearTimeout(searchDebounceTimer);

        if (searchTerm.length < 2) {
            closeSearchResults();
            return;
        }

        searchDebounceTimer = window.setTimeout(async () => {
            try {
                const searchItems = await fetchSearchResults(searchTerm);
                renderSearchResults(searchItems);
            } catch (error) {
                fanclubSearchResults.innerHTML = '<div class="fanclub-search-result-empty">Erro ao carregar os cadastros.</div>';
                fanclubSearchResults.hidden = false;
            }
        }, 350);
    });

    fanclubSearchInput.addEventListener('focus', () => {
        const searchTerm = String(fanclubSearchInput.value || '').trim();

        if (searchTerm.length < 2) {
            return;
        }

        fanclubSearchInput.dispatchEvent(new Event('input'));
    });
}

if (fanclubSearchResults) {
    fanclubSearchResults.addEventListener('click', (event) => {
        const target = event.target;

        if (!(target instanceof HTMLElement)) {
            return;
        }

        if (target.closest('a')) {
            return;
        }

        const resultItem = target.closest('.fanclub-search-result-item');

        if (!(resultItem instanceof HTMLElement)) {
            return;
        }

        const profileHref = String(resultItem.dataset.profileHref || '').trim();

        if (profileHref) {
            window.location.href = profileHref;
        }
    });

    fanclubSearchResults.addEventListener('keydown', (event) => {
        const target = event.target;

        if (!(target instanceof HTMLElement)) {
            return;
        }

        const resultItem = target.closest('.fanclub-search-result-item');

        if (!(resultItem instanceof HTMLElement)) {
            return;
        }

        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();

        const profileHref = String(resultItem.dataset.profileHref || '').trim();

        if (profileHref) {
            window.location.href = profileHref;
        }
    });
}

window.addEventListener('storage', (event) => {
    if (event.key && (event.key === CURRENT_USER_KEY_STORAGE || event.key.startsWith('fanClubUserName:') || event.key.startsWith('fanClubUserPhoto:'))) {
        renderUserHeader();
    }
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        renderUserHeader();
    }
});

document.addEventListener('click', (event) => {
    if (!fanclubSearchInput || !fanclubSearchResults) {
        return;
    }

    const clickedInsideSearch = event.target instanceof Element && event.target.closest('.fanclub-search');

    if (!clickedInsideSearch) {
        closeSearchResults();
    }
});