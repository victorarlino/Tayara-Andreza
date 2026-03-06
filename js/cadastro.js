const estadoSelect = document.getElementById('estado');
const cidadeSelect = document.getElementById('cidade');
const cadastroForm = document.querySelector('.fans-form');
const nomeInput = document.getElementById('nome');
const nascimentoInput = document.getElementById('nascimento');
const emailInput = document.getElementById('email');
const confirmarEmailInput = document.getElementById('confirmarEmail');
const telefoneInput = document.getElementById('telefone');
const paisInput = document.getElementById('pais');
const senhaInput = document.getElementById('senha');
const CURRENT_USER_KEY_STORAGE = 'fanClubCurrentUserKey';

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

estadoSelect.addEventListener('change', (event) => {
    carregarCidadesPorEstado(event.target.value);
});

carregarEstados();

if (cadastroForm) {
    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (emailInput.value.trim().toLowerCase() !== confirmarEmailInput.value.trim().toLowerCase()) {
            alert('Os e-mails não conferem.');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: nomeInput.value.trim(),
                    nascimento: nascimentoInput.value.trim(),
                    email: emailInput.value.trim(),
                    confirmarEmail: confirmarEmailInput.value.trim(),
                    telefone: telefoneInput.value.trim(),
                    pais: paisInput.value,
                    estado: estadoSelect.value,
                    cidade: cidadeSelect.value,
                    senha: senhaInput.value
                })
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || 'Não foi possível criar a conta.');
                return;
            }

            const userKey = emailInput.value.trim().toLowerCase();

            localStorage.setItem(CURRENT_USER_KEY_STORAGE, userKey);
            localStorage.setItem(`fanClubUserName:${userKey}`, nomeInput.value.trim() || 'fã');
            localStorage.setItem(
                `fanClubProfile:${userKey}`,
                JSON.stringify({
                    city: cidadeSelect.value,
                    state: estadoSelect.value,
                    birthDate: nascimentoInput.value.trim(),
                    social: '',
                    fanclubUrl: '',
                    bio: ''
                })
            );

            window.location.href = 'fa-clube.html';
        } catch (error) {
            alert('Erro de conexão com o servidor. Tente novamente.');
        }
    });
}
