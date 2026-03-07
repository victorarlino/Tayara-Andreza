const form = document.getElementById('searchForm');
const rows = document.getElementById('rows');
const fanClubRows = document.getElementById('fanClubRows');
const feedback = document.getElementById('feedback');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const cidadeInput = document.getElementById('cidade');
const estadoInput = document.getElementById('estado');
const CURRENT_USER_KEY_STORAGE = 'fanClubCurrentUserKey';
const ADMIN_CONSULTA_EMAIL = 'victorduartearlino2210@gmail.com';
const CURRENT_USER_ACCESS_TOKEN_KEY = 'fanClubCurrentUserAccessToken';
const SUPABASE_PESSOAS_URL = 'https://myyrzxvycljhcubyjaal.supabase.co/rest/v1/pessoas';
const SUPABASE_API_KEY = 'sb_publishable_2EfqfV5GqNDtejVD5KF5sQ_fwuyxhL-';
const SUPABASE_BEARER = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eXJ6eHZ5Y2xqaGN1YnlqYWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NTgwOTcsImV4cCI6MjA4ODMzNDA5N30.PcXyphhcsiBAsbPLxI6JqQls86ZHA2zQsKyniMifkQw';

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

function enforceConsultaAccess() {
    const currentUserEmail = (localStorage.getItem(CURRENT_USER_KEY_STORAGE) || '').trim().toLowerCase();

    if (!currentUserEmail) {
        alert('Você precisa fazer login para acessar a consulta de pessoas.');
        window.location.href = 'fans.html';
        return false;
    }

    if (currentUserEmail !== ADMIN_CONSULTA_EMAIL) {
        alert('Acesso negado. Esta tela é exclusiva do administrador.');
        window.location.href = 'fa-clube.html';
        return false;
    }

    return true;
}

function escapeHtml(text) {
    return String(text || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatDateTime(value) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return date.toLocaleString('pt-BR');
}

function renderRows(pessoas) {
    if (!pessoas.length) {
        rows.innerHTML = '<tr><td colspan="7">Nenhum resultado encontrado.</td></tr>';
        return;
    }

    rows.innerHTML = pessoas.map((pessoa) => `
        <tr>
            <td>${escapeHtml(pessoa.nome)}</td>
            <td>${escapeHtml(pessoa.email)}</td>
            <td>${escapeHtml(pessoa.telefone)}</td>
            <td>${escapeHtml(pessoa.cidade)}</td>
            <td>${escapeHtml(pessoa.estado)}</td>
            <td>${escapeHtml(pessoa.pais)}</td>
            <td><button type="button" class="danger-btn delete-pessoa-btn" data-id="${escapeHtml(pessoa.id)}">Excluir</button></td>
        </tr>
    `).join('');
}

function renderFanClubRows(fanClubes) {
    if (!fanClubes.length) {
        fanClubRows.innerHTML = '<tr><td colspan="9">Nenhum fã clube encontrado.</td></tr>';
        return;
    }

    fanClubRows.innerHTML = fanClubes.map((fanClube) => `
        <tr>
            <td>${escapeHtml(fanClube.nome)}</td>
            <td>${escapeHtml(fanClube.responsavel)}</td>
            <td>${escapeHtml(fanClube.email)}</td>
            <td>${escapeHtml(formatDateTime(fanClube.created_at))}</td>
            <td>${escapeHtml(fanClube.cidade)}</td>
            <td>${escapeHtml(fanClube.estado)}</td>
            <td>${escapeHtml(fanClube.instagram)}</td>
            <td>${escapeHtml(fanClube.tiktok)}</td>
            <td><button type="button" class="danger-btn delete-fanclube-btn" data-id="${escapeHtml(fanClube.id)}">Excluir</button></td>
        </tr>
    `).join('');
}

function getAuthHeaders() {
    const accessToken = (localStorage.getItem(CURRENT_USER_ACCESS_TOKEN_KEY) || '').trim();

    if (!accessToken) {
        return undefined;
    }

    return {
        Authorization: `Bearer ${accessToken}`
    };
}

function containsFilter(value, filter) {
    if (!filter) {
        return true;
    }

    return String(value || '').toLowerCase().includes(String(filter || '').toLowerCase());
}

function applyFilters(pessoas) {
    const nome = nomeInput.value.trim().toLowerCase();
    const email = emailInput.value.trim().toLowerCase();
    const cidade = cidadeInput.value.trim().toLowerCase();
    const estado = estadoInput.value.trim().toLowerCase();

    return pessoas.filter((pessoa) => (
        containsFilter(pessoa.nome, nome) &&
        containsFilter(pessoa.email, email) &&
        containsFilter(pessoa.cidade, cidade) &&
        containsFilter(pessoa.estado, estado)
    ));
}

async function buscarPessoasDiretoSupabase() {
    const response = await fetch(`${SUPABASE_PESSOAS_URL}?select=*`, {
        headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: SUPABASE_BEARER
        }
    });

    if (!response.ok) {
        throw new Error('Falha ao consultar direto no Supabase REST.');
    }

    const pessoas = await response.json();
    return applyFilters(Array.isArray(pessoas) ? pessoas : []).slice(0, 100);
}

async function buscarPessoas() {
    feedback.textContent = 'Consultando...';

    const params = new URLSearchParams({
        nome: nomeInput.value.trim(),
        email: emailInput.value.trim(),
        cidade: cidadeInput.value.trim(),
        estado: estadoInput.value.trim(),
        limit: '100'
    });

    let pessoas = [];
    let fanClubes = [];
    const requestHeaders = getAuthHeaders();

    try {
        const response = await fetch(`${API_BASE_URL}/api/cadastros/pessoas?${params.toString()}`, {
            headers: requestHeaders
        });
        const result = await response.json();

        if (!response.ok) {
            pessoas = await buscarPessoasDiretoSupabase();
        } else {
            pessoas = result.pessoas || [];
        }
    } catch (error) {
        try {
            pessoas = await buscarPessoasDiretoSupabase();
        } catch (supabaseError) {
            pessoas = [];
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/cadastros/fan-clubes?${params.toString()}`, {
            headers: requestHeaders
        });
        const result = await response.json();

        if (response.ok) {
            fanClubes = result.fanClubes || [];
        } else {
            fanClubes = [];
        }
    } catch (error) {
        fanClubes = [];
    }

    renderRows(pessoas);
    renderFanClubRows(fanClubes);
    feedback.textContent = `${pessoas.length} pessoa(s) e ${fanClubes.length} fã clube(s) encontrado(s).`;
}

async function excluirPessoa(id) {
    if (!id) {
        return;
    }

    const confirmar = window.confirm('Deseja realmente excluir esta pessoa?');

    if (!confirmar) {
        return;
    }

    const response = await fetch(`${API_BASE_URL}/api/cadastros/pessoas/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    const result = await response.json();

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            alert(result.message || 'Sua sessão expirou. Faça login novamente.');
            if (response.status === 401) {
                window.location.href = 'fans.html';
            }
            return;
        }

        alert(result.message || 'Não foi possível excluir a pessoa.');
        return;
    }

    await buscarPessoas();
}

async function excluirFanClube(id) {
    if (!id) {
        return;
    }

    const confirmar = window.confirm('Deseja realmente excluir este fã clube?');

    if (!confirmar) {
        return;
    }

    const endpoints = [
        `${API_BASE_URL}/api/cadastros/fan-clubes/${encodeURIComponent(id)}`,
        `${API_BASE_URL}/api/cadastros/fan_clubes/${encodeURIComponent(id)}`
    ];

    let response = null;
    let result = null;

    for (const endpoint of endpoints) {
        response = await fetch(endpoint, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        try {
            result = await response.json();
        } catch (parseError) {
            result = {};
        }

        if (response.ok || response.status !== 404) {
            break;
        }
    }

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            alert(result.message || 'Sua sessão expirou. Faça login novamente.');
            window.location.href = 'fans.html';
            return;
        }

        if (response.status === 404) {
            await buscarPessoas();
            return;
        }

        alert(result.message || 'Não foi possível excluir o fã clube.');
        return;
    }

    if (result?.message) {
        feedback.textContent = result.message;
    }

    await buscarPessoas();
}

rows.addEventListener('click', async (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
        return;
    }

    const button = target.closest('.delete-pessoa-btn');

    if (!button) {
        return;
    }

    const id = button.getAttribute('data-id') || '';
    await excluirPessoa(id);
});

fanClubRows.addEventListener('click', async (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
        return;
    }

    const button = target.closest('.delete-fanclube-btn');

    if (!button) {
        return;
    }

    const id = button.getAttribute('data-id') || '';
    await excluirFanClube(id);
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await buscarPessoas();
});

if (enforceConsultaAccess()) {
    buscarPessoas();
}
