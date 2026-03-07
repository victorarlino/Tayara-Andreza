const avatarInput = document.getElementById('avatarInput');
const cameraBtn = document.getElementById('cameraBtn');
const avatarImage = document.getElementById('avatarImage');
const fanClubNameInput = document.getElementById('fanClubName');
const descriptionInput = document.getElementById('descricao');
const nameCount = document.getElementById('nameCount');
const descriptionCount = document.getElementById('descriptionCount');
const estadoSelect = document.getElementById('estado');
const cidadeSelect = document.getElementById('cidade');
const fanClubUrlInput = document.getElementById('fanClubUrl');
const foundationDateInput = document.getElementById('foundationDate');
const responsavelInput = document.getElementById('responsavel');
const telefoneContatoInput = document.getElementById('telefoneContato');
const instagramUrlInput = document.getElementById('instagramUrl');
const tiktokUrlInput = document.getElementById('tiktokUrl');
const submitFeedback = document.getElementById('submitFeedback');
const officialForm = document.getElementById('officialForm');
const CURRENT_USER_KEY_STORAGE = 'fanClubCurrentUserKey';
const CURRENT_USER_NAME_PREFIX = 'fanClubUserName:';
const CURRENT_USER_ACCESS_TOKEN_KEY = 'fanClubCurrentUserAccessToken';

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

function updateCounter(input, counterElement) {
    counterElement.textContent = String(input.value.length);
}

function setLoadingCities() {
    cidadeSelect.innerHTML = '<option value="" selected>Carregando cidades...</option>';
    cidadeSelect.disabled = true;
}

function resetCities() {
    cidadeSelect.innerHTML = '<option value="" selected>Selecione</option>';
    cidadeSelect.disabled = false;
}

async function carregarEstados() {
    try {
        const resposta = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        const estados = await resposta.json();

        estados
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
            .forEach((estado) => {
                const option = document.createElement('option');
                option.value = estado.sigla;
                option.textContent = estado.nome;
                estadoSelect.appendChild(option);
            });
    } catch (erro) {
        estadoSelect.innerHTML = '<option value="" selected>Erro ao carregar estados</option>';
    }
}

async function carregarCidadesPorEstado(uf) {
    if (!uf) {
        resetCities();
        return;
    }

    setLoadingCities();

    try {
        const resposta = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
        const cidades = await resposta.json();

        cidadeSelect.innerHTML = '<option value="" selected>Selecione</option>';

        cidades.forEach((cidade) => {
            const option = document.createElement('option');
            option.value = cidade.nome;
            option.textContent = cidade.nome;
            cidadeSelect.appendChild(option);
        });

        cidadeSelect.disabled = false;
    } catch (erro) {
        cidadeSelect.innerHTML = '<option value="" selected>Erro ao carregar cidades</option>';
        cidadeSelect.disabled = true;
    }
}

cameraBtn.addEventListener('click', () => {
    avatarInput.click();
});

avatarInput.addEventListener('change', (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        const imageResult = reader.result;

        if (typeof imageResult === 'string') {
            avatarImage.src = imageResult;
            avatarImage.hidden = false;
        }
    };

    reader.readAsDataURL(selectedFile);
});

fanClubNameInput.addEventListener('input', () => {
    updateCounter(fanClubNameInput, nameCount);
});

descriptionInput.addEventListener('input', () => {
    updateCounter(descriptionInput, descriptionCount);
});

estadoSelect.addEventListener('change', (event) => {
    carregarCidadesPorEstado(event.target.value);
});

officialForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const instagramUrl = instagramUrlInput.value.trim();
    const tiktokUrl = tiktokUrlInput.value.trim();

    const hasInstagram = Boolean(instagramUrl);
    const hasTikTok = Boolean(tiktokUrl);

    if (!fanClubNameInput.value.trim()) {
        submitFeedback.textContent = 'Informe o nome do fã clube.';
        return;
    }

    if (!hasInstagram || !hasTikTok) {
        submitFeedback.textContent = 'Adicione as duas URLs (Instagram e TikTok) para enviar o cadastro.';
        return;
    }

    const currentUserEmail = (localStorage.getItem(CURRENT_USER_KEY_STORAGE) || '').trim().toLowerCase();

    if (!currentUserEmail) {
        submitFeedback.textContent = 'Faça login novamente para vincular o cadastro ao seu perfil.';
        return;
    }

    try {
        const responsavelLocal = (localStorage.getItem(`${CURRENT_USER_NAME_PREFIX}${currentUserEmail}`) || '').trim();
        const responsavel = responsavelInput.value.trim() || responsavelLocal;
        const accessToken = (localStorage.getItem(CURRENT_USER_ACCESS_TOKEN_KEY) || '').trim();

        if (!responsavel) {
            submitFeedback.textContent = 'Informe o responsável pelo fã clube.';
            return;
        }

        const requestHeaders = {
            'Content-Type': 'application/json'
        };

        if (accessToken) {
            requestHeaders.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/cadastros/fan-clubes`, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify({
                email: currentUserEmail,
                responsavel,
                telefoneContato: telefoneContatoInput.value.trim(),
                nome: fanClubNameInput.value.trim(),
                url: fanClubUrlInput.value.trim(),
                dataFundacao: foundationDateInput.value,
                estado: estadoSelect.value,
                cidade: cidadeSelect.value,
                instagramUrl,
                tiktokUrl,
                descricao: descriptionInput.value.trim()
            })
        });

        const result = await response.json();

        if (!response.ok) {
            const details = result.detail ? ` (${result.detail})` : '';
            submitFeedback.textContent = `${result.message || 'Não foi possível enviar para análise.'}${details}`;
            return;
        }

        submitFeedback.textContent = 'Chance em dobro! Seu cadastro foi enviado para análise.';
    } catch (error) {
        submitFeedback.textContent = 'Erro de conexão com o servidor. Tente novamente.';
    }
});

const currentUserEmail = (localStorage.getItem(CURRENT_USER_KEY_STORAGE) || '').trim().toLowerCase();
const defaultResponsavel = (localStorage.getItem(`${CURRENT_USER_NAME_PREFIX}${currentUserEmail}`) || '').trim();

if (defaultResponsavel) {
    responsavelInput.value = defaultResponsavel;
}

carregarEstados();
