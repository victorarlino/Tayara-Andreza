const avatarInput = document.getElementById('avatarInput');
const cameraBtn = document.getElementById('cameraBtn');
const avatarImage = document.getElementById('avatarImage');
const fanClubNameInput = document.getElementById('fanClubName');
const descriptionInput = document.getElementById('descricao');
const nameCount = document.getElementById('nameCount');
const descriptionCount = document.getElementById('descriptionCount');
const estadoSelect = document.getElementById('estado');
const cidadeSelect = document.getElementById('cidade');
const redeSocialSelect = document.getElementById('redeSocial');
const redeSocialUrlInput = document.getElementById('redeSocialUrl');
const addSocialBtn = document.querySelector('.add-social-btn');
const socialFeedback = document.getElementById('socialFeedback');
const submitFeedback = document.getElementById('submitFeedback');
const officialForm = document.getElementById('officialForm');

const socialLinks = {
    Instagram: '',
    TikTok: ''
};
const usedSocialUrls = new Set();

function normalizeUrl(url) {
    return url.trim().toLowerCase();
}

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

addSocialBtn.addEventListener('click', () => {
    const selectedSocial = redeSocialSelect.value;
    const socialUrl = redeSocialUrlInput.value.trim();
    const normalizedSocialUrl = normalizeUrl(socialUrl);

    if (!socialUrl) {
        socialFeedback.textContent = 'Insira a URL antes de adicionar a rede social.';
        return;
    }

    const previousUrl = socialLinks[selectedSocial];
    const normalizedPreviousUrl = previousUrl ? normalizeUrl(previousUrl) : '';

    if (usedSocialUrls.has(normalizedSocialUrl) && normalizedPreviousUrl !== normalizedSocialUrl) {
        socialFeedback.textContent = 'Essa URL já foi cadastrada. Use uma URL diferente.';
        return;
    }

    if (normalizedPreviousUrl && normalizedPreviousUrl !== normalizedSocialUrl) {
        usedSocialUrls.delete(normalizedPreviousUrl);
    }

    socialLinks[selectedSocial] = socialUrl;
    usedSocialUrls.add(normalizedSocialUrl);
    redeSocialUrlInput.value = '';

    const hasInstagram = Boolean(socialLinks.Instagram);
    const hasTikTok = Boolean(socialLinks.TikTok);

    if (hasInstagram && hasTikTok) {
        socialFeedback.textContent = 'Instagram e TikTok adicionados com sucesso.';
    } else {
        socialFeedback.textContent = `${selectedSocial} adicionado com sucesso.`;
    }
});

officialForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const hasInstagram = Boolean(socialLinks.Instagram);
    const hasTikTok = Boolean(socialLinks.TikTok);

    if (!hasInstagram || !hasTikTok) {
        submitFeedback.textContent = 'Adicione as duas URLs (Instagram e TikTok) para enviar o cadastro.';
        return;
    }

    submitFeedback.textContent = 'Chance em dobro! Seu cadastro foi enviado para análise.';
});

carregarEstados();
