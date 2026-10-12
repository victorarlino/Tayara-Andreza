window.APP_API = window.APP_API || (() => {
    const API_BASE_STORAGE_KEY = 'fanClubApiBaseUrl';
    const API_PARAM_KEY = 'api';
    const CURRENT_USER_ACCESS_TOKEN_KEY = 'fanClubCurrentUserAccessToken';
    const ADMIN_CONSULTA_EMAIL = 'victorduartearlino2210@gmail.com';
    const BLOCKED_API_HOSTS = ['tayara-api.onrender.com'];
    let activeBaseUrl = '';

    function normalizeBaseUrl(value) {
        const raw = String(value || '').trim();

        if (!raw) {
            return '';
        }

        const withoutTrailingSlash = raw.replace(/\/$/, '');

        if (!/^https?:\/\//i.test(withoutTrailingSlash)) {
            return '';
        }

        return withoutTrailingSlash;
    }

    function isBlockedBaseUrl(value) {
        const normalized = normalizeBaseUrl(value);

        if (!normalized) {
            return false;
        }

        try {
            const { hostname } = new URL(normalized);
            return BLOCKED_API_HOSTS.includes(String(hostname || '').toLowerCase());
        } catch (error) {
            return false;
        }
    }

    function normalizeDate(value) {
        const raw = String(value || '').trim();

        if (!raw) {
            return null;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            return raw;
        }

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
            const [day, month, year] = raw.split('/');
            return `${year}-${month}-${day}`;
        }

        return null;
    }

    function isApiEndpoint(endpoint) {
        return String(endpoint || '').trim().startsWith('/api/');
    }

    function looksLikeSupabaseUrl(baseUrl) {
        try {
            const parsed = new URL(String(baseUrl || ''));
            return parsed.hostname.endsWith('.supabase.co');
        } catch (error) {
            return false;
        }
    }

    function readStoredBaseUrl() {
        try {
            const storedValue = normalizeBaseUrl(window.localStorage.getItem(API_BASE_STORAGE_KEY));

            if (isBlockedBaseUrl(storedValue)) {
                window.localStorage.removeItem(API_BASE_STORAGE_KEY);
                return '';
            }

            return storedValue;
        } catch (error) {
            return '';
        }
    }

    function persistBaseUrl(value) {
        const normalized = normalizeBaseUrl(value);

        if (!normalized || isBlockedBaseUrl(normalized)) {
            return;
        }

        try {
            window.localStorage.setItem(API_BASE_STORAGE_KEY, normalized);
        } catch (error) {
            return;
        }
    }

    function readQueryParamBaseUrl() {
        try {
            const params = new URLSearchParams(window.location.search);
            const queryValue = normalizeBaseUrl(params.get(API_PARAM_KEY) || '');

            if (queryValue) {
                persistBaseUrl(queryValue);
            }

            return queryValue;
        } catch (error) {
            return '';
        }
    }

    function getSupabaseUrl() {
        const configuredSupabaseUrl = normalizeBaseUrl(window.APP_CONFIG?.SUPABASE_URL || '');

        if (configuredSupabaseUrl) {
            return configuredSupabaseUrl;
        }

        const configuredApiBaseUrl = normalizeBaseUrl(window.APP_CONFIG?.API_BASE_URL || '');

        if (looksLikeSupabaseUrl(configuredApiBaseUrl)) {
            return configuredApiBaseUrl;
        }

        return '';
    }

    function getSupabaseAnonKey() {
        return String(window.APP_CONFIG?.SUPABASE_ANON_KEY || '').trim();
    }

    function getApiCandidates() {
        const { hostname, port, protocol, origin } = window.location;
        const host = String(hostname || '').toLowerCase();
        const cleanHost = host.replace(/^www\./, '');
        const isLocalhost = cleanHost === '127.0.0.1' || cleanHost === 'localhost';
        const configuredBaseUrl = normalizeBaseUrl(window.APP_CONFIG?.API_BASE_URL || '');
        const configuredCandidates = Array.isArray(window.APP_CONFIG?.API_BASE_URLS)
            ? window.APP_CONFIG.API_BASE_URLS.map(normalizeBaseUrl).filter(Boolean)
            : [];

        const localDevBaseUrl = isLocalhost && port !== '3000'
            ? `${protocol}//${hostname}:3000`
            : '';

        const sameOriginBaseUrl = protocol.startsWith('http') ? origin : '';
        const apiSubdomainBaseUrl = !isLocalhost && cleanHost ? `${protocol}//api.${cleanHost}` : '';

        const candidates = [
            readQueryParamBaseUrl(),
            readStoredBaseUrl(),
            activeBaseUrl,
            configuredBaseUrl,
            ...configuredCandidates,
            sameOriginBaseUrl,
            apiSubdomainBaseUrl,
            localDevBaseUrl,
            'http://localhost:3000'
        ]
            .map(normalizeBaseUrl)
            .filter((candidate) => Boolean(candidate) && !isBlockedBaseUrl(candidate));

        return [...new Set(candidates)];
    }

    function getBaseUrl() {
        const candidates = getApiCandidates();

        if (!candidates.length) {
            return 'http://localhost:3000';
        }

        if (activeBaseUrl && candidates.includes(activeBaseUrl)) {
            return activeBaseUrl;
        }

        activeBaseUrl = candidates[0];
        return activeBaseUrl;
    }

    function resolveEndpoint(endpoint, baseUrl = getBaseUrl()) {
        const rawEndpoint = String(endpoint || '').trim();

        if (/^https?:\/\//i.test(rawEndpoint)) {
            return rawEndpoint;
        }

        const normalizedEndpoint = rawEndpoint.startsWith('/') ? rawEndpoint : `/${rawEndpoint}`;
        return `${baseUrl}${normalizedEndpoint}`;
    }

    function buildHeaders(headersLike) {
        const headers = new Headers();

        if (!headersLike) {
            return headers;
        }

        const providedHeaders = new Headers(headersLike);
        providedHeaders.forEach((value, key) => {
            headers.set(key, value);
        });

        return headers;
    }

    function buildRequestInit(options = {}) {
        const headers = buildHeaders(options.headers);

        return {
            method: options.method || 'GET',
            headers,
            body: options.body
        };
    }

    function parseJsonBody(options = {}) {
        const body = options.body;

        if (!body) {
            return {};
        }

        if (typeof body === 'string') {
            try {
                return JSON.parse(body);
            } catch (error) {
                return {};
            }
        }

        if (typeof body === 'object') {
            return body;
        }

        return {};
    }

    function getAccessTokenFromOptions(options = {}) {
        const headers = buildHeaders(options.headers);
        const authorization = String(headers.get('Authorization') || '').trim();

        if (authorization.toLowerCase().startsWith('bearer ')) {
            return authorization.slice(7).trim();
        }

        try {
            return String(window.localStorage.getItem(CURRENT_USER_ACCESS_TOKEN_KEY) || '').trim();
        } catch (error) {
            return '';
        }
    }

    function createJsonResponse(payload, status = 200) {
        return new Response(JSON.stringify(payload), {
            status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async function readJsonResponse(response) {
        try {
            return await response.clone().json();
        } catch (error) {
            return null;
        }
    }

    async function buildSupabaseErrorResponse(response, fallbackMessage, statusOverride) {
        const payload = await readJsonResponse(response);
        const message = payload?.msg || payload?.message || payload?.error_description || payload?.error || fallbackMessage;
        return createJsonResponse({ message }, statusOverride || response.status || 400);
    }

    function shouldRetryWithAnotherBase(response, endpoint) {
        if (!isApiEndpoint(endpoint)) {
            return false;
        }

        return response.status === 404 || response.status === 502 || response.status === 503 || response.status === 504;
    }

    async function supabaseFetch(path, { method = 'GET', headers = {}, body } = {}, accessToken = '') {
        const supabaseUrl = getSupabaseUrl();
        const supabaseAnonKey = getSupabaseAnonKey();

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('SUPABASE_URL ou SUPABASE_ANON_KEY não configurados no frontend.');
        }

        const requestHeaders = buildHeaders(headers);
        requestHeaders.set('apikey', supabaseAnonKey);
        requestHeaders.set('Authorization', `Bearer ${accessToken || supabaseAnonKey}`);

        if (body && !requestHeaders.has('Content-Type')) {
            requestHeaders.set('Content-Type', 'application/json');
        }

        return fetch(`${supabaseUrl}${path}`, {
            method,
            headers: requestHeaders,
            body
        });
    }

    async function findPessoaByEmail(email, accessToken) {
        const emailNormalized = String(email || '').trim().toLowerCase();

        if (!emailNormalized) {
            return { pessoa: null, source: null };
        }

        const attempts = [
            {
                table: 'pessoas',
                select: 'id,nome_completo,email'
            },
            {
                table: 'pessoa',
                select: 'id,nome,email'
            }
        ];

        for (const attempt of attempts) {
            const params = new URLSearchParams();
            params.set('select', attempt.select);
            params.set('email', `eq.${emailNormalized}`);
            params.set('limit', '1');

            const response = await supabaseFetch(`/rest/v1/${attempt.table}?${params.toString()}`, {
                method: 'GET'
            }, accessToken);

            if (!response.ok) {
                continue;
            }

            const rows = await readJsonResponse(response);
            const pessoa = Array.isArray(rows) ? rows[0] : null;

            if (pessoa?.id) {
                return { pessoa, source: attempt.table };
            }
        }

        return { pessoa: null, source: null };
    }

    async function resolveCurrentUser(accessToken) {
        if (!accessToken) {
            return null;
        }

        const response = await supabaseFetch('/auth/v1/user', {
            method: 'GET'
        }, accessToken);

        if (!response.ok) {
            return null;
        }

        return readJsonResponse(response);
    }

    async function ensureAdminToken(accessToken) {
        if (!accessToken) {
            return { ok: false, status: 401, message: 'Sessão inválida. Faça login novamente.' };
        }

        const user = await resolveCurrentUser(accessToken);
        const userEmail = String(user?.email || '').trim().toLowerCase();

        if (!userEmail) {
            return { ok: false, status: 401, message: 'Não foi possível validar a sessão do usuário.' };
        }

        if (userEmail !== ADMIN_CONSULTA_EMAIL) {
            return { ok: false, status: 403, message: 'Acesso negado. Apenas administrador pode excluir registros.' };
        }

        return { ok: true };
    }

    async function supabaseLogin(options) {
        const payload = parseJsonBody(options);
        const email = String(payload.email || '').trim().toLowerCase();
        const senha = String(payload.senha || '');

        if (!email || !senha) {
            return createJsonResponse({ message: 'Informe e-mail e senha.' }, 400);
        }

        const response = await supabaseFetch('/auth/v1/token?grant_type=password', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password: senha
            })
        });

        if (!response.ok) {
            return createJsonResponse({ message: 'E-mail ou senha inválidos.' }, 401);
        }

        const data = await readJsonResponse(response);

        return createJsonResponse({
            message: 'Login realizado com sucesso!',
            user: {
                id: data?.user?.id || null,
                email: data?.user?.email || email,
                nome: data?.user?.user_metadata?.nome || ''
            },
            session: {
                accessToken: data?.access_token || null
            }
        });
    }

    async function upsertPessoaRecord(payload, accessToken) {
        const attempts = [
            {
                table: 'pessoas',
                body: {
                    user_id: payload.userId,
                    nome_completo: payload.nome,
                    data_nascimento: normalizeDate(payload.nascimento),
                    email: payload.email,
                    telefone: payload.telefone,
                    pais: payload.pais,
                    estado: payload.estado,
                    cidade: payload.cidade
                }
            },
            {
                table: 'pessoa',
                body: {
                    user_id: payload.userId,
                    nome: payload.nome,
                    nascimento: payload.nascimento,
                    email: payload.email,
                    telefone: payload.telefone,
                    pais: payload.pais,
                    estado: payload.estado,
                    cidade: payload.cidade
                }
            }
        ];

        for (const attempt of attempts) {
            const response = await supabaseFetch(`/rest/v1/${attempt.table}?on_conflict=user_id`, {
                method: 'POST',
                headers: {
                    Prefer: 'resolution=merge-duplicates,return=representation'
                },
                body: JSON.stringify(attempt.body)
            }, accessToken);

            if (!response.ok) {
                continue;
            }

            const rows = await readJsonResponse(response);
            const pessoa = Array.isArray(rows) ? rows[0] : rows;
            return { ok: true, pessoa };
        }

        return { ok: false, pessoa: null };
    }

    async function supabaseRegister(options) {
        const payload = parseJsonBody(options);
        const nome = String(payload.nome || '').trim();
        const nascimento = String(payload.nascimento || '').trim();
        const email = String(payload.email || '').trim().toLowerCase();
        const telefone = String(payload.telefone || '').trim() || null;
        const pais = String(payload.pais || 'Brasil').trim() || 'Brasil';
        const estado = String(payload.estado || '').trim() || null;
        const cidade = String(payload.cidade || '').trim() || null;
        const senha = String(payload.senha || '');

        if (!nome || !email || !senha) {
            return createJsonResponse({ message: 'nome, email e senha são obrigatórios.' }, 400);
        }

        if (senha.length < 6) {
            return createJsonResponse({ message: 'A senha deve ter pelo menos 6 caracteres.' }, 400);
        }

        const signUpResponse = await supabaseFetch('/auth/v1/signup', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password: senha,
                data: {
                    nome,
                    telefone,
                    nascimento,
                    pais,
                    estado,
                    cidade
                }
            })
        });

        if (!signUpResponse.ok) {
            const signUpPayload = await readJsonResponse(signUpResponse);
            const signUpMessage = String(signUpPayload?.msg || signUpPayload?.message || signUpPayload?.error_description || '').toLowerCase();

            if (signUpMessage.includes('already') || signUpMessage.includes('already registered')) {
                return createJsonResponse({ message: 'Já existe uma conta com este e-mail.' }, 409);
            }

            return createJsonResponse({ message: signUpPayload?.msg || signUpPayload?.message || 'Não foi possível cadastrar user.' }, 400);
        }

        const signUpData = await readJsonResponse(signUpResponse);
        const createdUserId = String(signUpData?.user?.id || '').trim();
        let accessToken = String(signUpData?.access_token || signUpData?.session?.access_token || '').trim();

        if (!accessToken) {
            const loginResponse = await supabaseFetch('/auth/v1/token?grant_type=password', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password: senha
                })
            });

            if (loginResponse.ok) {
                const loginData = await readJsonResponse(loginResponse);
                accessToken = String(loginData?.access_token || '').trim();
            }
        }

        if (!createdUserId) {
            return createJsonResponse({ message: 'Não foi possível identificar o usuário criado.' }, 500);
        }

        const pessoaResult = await upsertPessoaRecord({
            userId: createdUserId,
            nome,
            nascimento,
            email,
            telefone,
            pais,
            estado,
            cidade
        }, accessToken);

        if (!pessoaResult.ok) {
            return createJsonResponse({
                message: 'Conta criada com sucesso! Não foi possível sincronizar a tabela de pessoas agora, mas você já pode acessar o sistema.',
                user: {
                    id: createdUserId,
                    email
                },
                pessoa: null,
                session: {
                    accessToken: accessToken || null
                }
            }, 201);
        }

        return createJsonResponse({
            message: 'User e pessoa cadastrados com sucesso!',
            user: {
                id: createdUserId,
                email
            },
            pessoa: pessoaResult.pessoa,
            session: {
                accessToken: accessToken || null
            }
        }, 201);
    }

    async function supabaseResetPassword(options) {
        const payload = parseJsonBody(options);
        const email = String(payload.email || '').trim().toLowerCase();

        if (!email) {
            return createJsonResponse({ message: 'Informe o e-mail para recuperação.' }, 400);
        }

        const response = await supabaseFetch('/auth/v1/recover', {
            method: 'POST',
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            return buildSupabaseErrorResponse(response, 'Não foi possível solicitar a redefinição de senha.', 400);
        }

        return createJsonResponse({ message: 'Solicitação enviada. Verifique seu e-mail para redefinir a senha.' }, 200);
    }

    async function supabaseListPessoas(endpoint, options) {
        const endpointUrl = new URL(`https://local${endpoint}`);
        const inputParams = endpointUrl.searchParams;
        const safeLimit = Number.isFinite(Number(inputParams.get('limit')))
            ? Math.min(Math.max(Number(inputParams.get('limit')), 1), 200)
            : 100;
        const accessToken = getAccessTokenFromOptions(options);

        const attempts = [
            {
                table: 'pessoas',
                select: 'id,user_id,nome_completo,data_nascimento,email,telefone,pais,estado,cidade,created_at',
                filters: {
                    nome: 'nome_completo',
                    email: 'email',
                    cidade: 'cidade',
                    estado: 'estado'
                },
                mapper: (item) => ({
                    id: item.id,
                    user_id: item.user_id,
                    nome: item.nome_completo,
                    nascimento: item.data_nascimento,
                    email: item.email,
                    telefone: item.telefone,
                    pais: item.pais,
                    estado: item.estado,
                    cidade: item.cidade,
                    created_at: item.created_at
                })
            },
            {
                table: 'pessoa',
                select: 'id,user_id,nome,nascimento,email,telefone,pais,estado,cidade,created_at',
                filters: {
                    nome: 'nome',
                    email: 'email',
                    cidade: 'cidade',
                    estado: 'estado'
                },
                mapper: (item) => ({
                    id: item.id,
                    user_id: item.user_id,
                    nome: item.nome,
                    nascimento: item.nascimento,
                    email: item.email,
                    telefone: item.telefone,
                    pais: item.pais,
                    estado: item.estado,
                    cidade: item.cidade,
                    created_at: item.created_at
                })
            }
        ];

        for (const attempt of attempts) {
            const params = new URLSearchParams();
            params.set('select', attempt.select);
            params.set('order', 'created_at.desc');
            params.set('limit', String(safeLimit));

            const nome = String(inputParams.get('nome') || '').trim();
            const email = String(inputParams.get('email') || '').trim();
            const cidade = String(inputParams.get('cidade') || '').trim();
            const estado = String(inputParams.get('estado') || '').trim();

            if (nome) {
                params.set(attempt.filters.nome, `ilike.*${nome}*`);
            }

            if (email) {
                params.set(attempt.filters.email, `ilike.*${email}*`);
            }

            if (cidade) {
                params.set(attempt.filters.cidade, `ilike.*${cidade}*`);
            }

            if (estado) {
                params.set(attempt.filters.estado, `ilike.*${estado}*`);
            }

            const response = await supabaseFetch(`/rest/v1/${attempt.table}?${params.toString()}`, {
                method: 'GET'
            }, accessToken);

            if (!response.ok) {
                continue;
            }

            const rows = await readJsonResponse(response);
            const pessoas = Array.isArray(rows) ? rows.map(attempt.mapper) : [];

            return createJsonResponse({ total: pessoas.length, pessoas });
        }

        return createJsonResponse({ message: 'Não foi possível consultar pessoas.' }, 400);
    }

    async function supabaseListFanClubes(endpoint, options) {
        const endpointUrl = new URL(`https://local${endpoint}`);
        const inputParams = endpointUrl.searchParams;
        const safeLimit = Number.isFinite(Number(inputParams.get('limit')))
            ? Math.min(Math.max(Number(inputParams.get('limit')), 1), 200)
            : 100;
        const accessToken = getAccessTokenFromOptions(options);

        const attempts = [
            {
                select: 'id,pessoa_id,email,responsavel,nome_fa_clube,cidade,estado,instagram,tiktok,created_at',
                filters: {
                    nome: 'nome_fa_clube',
                    email: 'email',
                    cidade: 'cidade',
                    estado: 'estado'
                },
                mapper: (item) => ({
                    id: item.id,
                    pessoa_id: item.pessoa_id,
                    nome: item.nome_fa_clube,
                    email: item.email,
                    responsavel: item.responsavel,
                    cidade: item.cidade,
                    estado: item.estado,
                    instagram: item.instagram,
                    tiktok: item.tiktok,
                    created_at: item.created_at
                })
            },
            {
                select: 'id,pessoa_id,nome,url,data_fundacao,cidade,estado,instagram_url,tiktok_url,created_at',
                filters: {
                    nome: 'nome',
                    email: null,
                    cidade: 'cidade',
                    estado: 'estado'
                },
                mapper: (item) => ({
                    id: item.id,
                    pessoa_id: item.pessoa_id,
                    nome: item.nome,
                    email: '',
                    responsavel: '',
                    cidade: item.cidade,
                    estado: item.estado,
                    instagram: item.instagram_url,
                    tiktok: item.tiktok_url,
                    created_at: item.created_at
                })
            }
        ];

        for (const attempt of attempts) {
            const params = new URLSearchParams();
            params.set('select', attempt.select);
            params.set('order', 'created_at.desc');
            params.set('limit', String(safeLimit));

            const nome = String(inputParams.get('nome') || '').trim();
            const email = String(inputParams.get('email') || '').trim();
            const cidade = String(inputParams.get('cidade') || '').trim();
            const estado = String(inputParams.get('estado') || '').trim();

            if (nome && attempt.filters.nome) {
                params.set(attempt.filters.nome, `ilike.*${nome}*`);
            }

            if (email && attempt.filters.email) {
                params.set(attempt.filters.email, `ilike.*${email}*`);
            }

            if (cidade && attempt.filters.cidade) {
                params.set(attempt.filters.cidade, `ilike.*${cidade}*`);
            }

            if (estado && attempt.filters.estado) {
                params.set(attempt.filters.estado, `ilike.*${estado}*`);
            }

            const response = await supabaseFetch(`/rest/v1/fan_clubes?${params.toString()}`, {
                method: 'GET'
            }, accessToken);

            if (!response.ok) {
                continue;
            }

            const rows = await readJsonResponse(response);
            const fanClubes = Array.isArray(rows) ? rows.map(attempt.mapper) : [];
            return createJsonResponse({ total: fanClubes.length, fanClubes });
        }

        return createJsonResponse({ message: 'Não foi possível consultar fã clubes.' }, 400);
    }

    async function supabaseCreateFanClube(options) {
        const payload = parseJsonBody(options);
        const nome = String(payload.nome || '').trim();
        const instagramUrl = String(payload.instagramUrl || '').trim();
        const tiktokUrl = String(payload.tiktokUrl || '').trim();
        const email = String(payload.email || '').trim().toLowerCase();
        const accessToken = getAccessTokenFromOptions(options);

        if (!nome || !instagramUrl || !tiktokUrl) {
            return createJsonResponse({ message: 'nome, instagramUrl e tiktokUrl são obrigatórios.' }, 400);
        }

        if (!email) {
            return createJsonResponse({ message: 'email é obrigatório para cadastrar fã clube.' }, 400);
        }

        let pessoaLookup = await findPessoaByEmail(email, accessToken);

        if (!pessoaLookup.pessoa?.id && accessToken) {
            const currentUser = await resolveCurrentUser(accessToken);

            if (currentUser?.id && String(currentUser?.email || '').trim().toLowerCase() === email) {
                const metadata = currentUser.user_metadata || {};
                await upsertPessoaRecord({
                    userId: currentUser.id,
                    nome: String(metadata.nome || payload.responsavel || '').trim() || email.split('@')[0],
                    nascimento: String(metadata.nascimento || '').trim(),
                    email,
                    telefone: String(metadata.telefone || payload.telefoneContato || '').trim() || null,
                    pais: String(metadata.pais || 'Brasil').trim() || 'Brasil',
                    estado: String(metadata.estado || payload.estado || '').trim() || null,
                    cidade: String(metadata.cidade || payload.cidade || '').trim() || null
                }, accessToken);

                pessoaLookup = await findPessoaByEmail(email, accessToken);
            }
        }

        if (!pessoaLookup.pessoa?.id) {
            return createJsonResponse({ message: 'Pessoa não encontrada para o e-mail informado.' }, 404);
        }

        const responsavel = String(payload.responsavel || pessoaLookup.pessoa.nome_completo || pessoaLookup.pessoa.nome || '').trim();

        if (!responsavel) {
            return createJsonResponse({ message: 'responsavel é obrigatório para cadastrar fã clube.' }, 400);
        }

        const attempts = [
            {
                body: {
                    pessoa_id: pessoaLookup.pessoa.id,
                    email,
                    telefone_contato: payload.telefoneContato ? String(payload.telefoneContato).trim() : null,
                    responsavel,
                    nome_fa_clube: nome,
                    url_fa_clube: payload.url ? String(payload.url).trim() : null,
                    data_fundacao: normalizeDate(payload.dataFundacao),
                    estado: payload.estado ? String(payload.estado).trim() : null,
                    cidade: payload.cidade ? String(payload.cidade).trim() : null,
                    instagram: instagramUrl,
                    tiktok: tiktokUrl,
                    descricao: payload.descricao ? String(payload.descricao).trim() : null
                }
            },
            {
                body: {
                    pessoa_id: pessoaLookup.pessoa.id,
                    nome,
                    url: payload.url ? String(payload.url).trim() : null,
                    data_fundacao: normalizeDate(payload.dataFundacao),
                    estado: payload.estado ? String(payload.estado).trim() : null,
                    cidade: payload.cidade ? String(payload.cidade).trim() : null,
                    instagram_url: instagramUrl,
                    tiktok_url: tiktokUrl,
                    descricao: payload.descricao ? String(payload.descricao).trim() : null
                }
            }
        ];

        for (const attempt of attempts) {
            const response = await supabaseFetch('/rest/v1/fan_clubes', {
                method: 'POST',
                headers: {
                    Prefer: 'return=representation'
                },
                body: JSON.stringify(attempt.body)
            }, accessToken);

            if (!response.ok) {
                continue;
            }

            const rows = await readJsonResponse(response);
            const fanClube = Array.isArray(rows) ? rows[0] : rows;
            return createJsonResponse({ message: 'Fã clube cadastrado com sucesso!', fanClube }, 201);
        }

        return createJsonResponse({
            message: 'Permissão negada no Supabase (RLS) para cadastrar fã clube. Execute o SQL em server/sql/fan_clubes_policies.sql no painel do Supabase.'
        }, 403);
    }

    async function supabaseDeletePessoa(endpoint, options) {
        const id = String(endpoint.split('/').pop() || '').trim();
        const accessToken = getAccessTokenFromOptions(options);
        const adminCheck = await ensureAdminToken(accessToken);

        if (!adminCheck.ok) {
            return createJsonResponse({ message: adminCheck.message }, adminCheck.status);
        }

        if (!id) {
            return createJsonResponse({ message: 'id da pessoa é obrigatório.' }, 400);
        }

        await supabaseFetch(`/rest/v1/fan_clubes?pessoa_id=eq.${encodeURIComponent(id)}`, {
            method: 'DELETE'
        }, accessToken);

        const attempts = ['pessoas', 'pessoa'];

        for (const table of attempts) {
            const response = await supabaseFetch(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: {
                    Prefer: 'return=representation'
                }
            }, accessToken);

            if (!response.ok) {
                continue;
            }

            const rows = await readJsonResponse(response);

            if (Array.isArray(rows) && rows.length) {
                return createJsonResponse({ message: 'Pessoa excluída com sucesso.' });
            }
        }

        return createJsonResponse({ message: 'Pessoa não encontrada para exclusão.' }, 404);
    }

    async function supabaseDeleteFanClube(endpoint, options) {
        const id = String(endpoint.split('/').pop() || '').trim();
        const accessToken = getAccessTokenFromOptions(options);
        const adminCheck = await ensureAdminToken(accessToken);

        if (!adminCheck.ok) {
            return createJsonResponse({ message: adminCheck.message }, adminCheck.status);
        }

        if (!id) {
            return createJsonResponse({ message: 'id do fã clube é obrigatório.' }, 400);
        }

        const response = await supabaseFetch(`/rest/v1/fan_clubes?id=eq.${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: {
                Prefer: 'return=representation'
            }
        }, accessToken);

        if (!response.ok) {
            return createJsonResponse({ message: 'Não foi possível excluir fã clube.' }, 400);
        }

        const rows = await readJsonResponse(response);

        if (!Array.isArray(rows) || !rows.length) {
            return createJsonResponse({ message: 'Fã clube não encontrado para exclusão.' }, 404);
        }

        return createJsonResponse({ message: 'Fã clube excluído com sucesso.' });
    }

    async function requestViaSupabaseAdapter(endpoint, options = {}) {
        const normalizedEndpoint = String(endpoint || '').trim();
        const method = String(options.method || 'GET').toUpperCase();
        const path = normalizedEndpoint.split('?')[0];

        if (!isApiEndpoint(normalizedEndpoint)) {
            return null;
        }

        if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
            return null;
        }

        if (method === 'GET' && path === '/api/cadastros/diagnostico/supabase') {
            return createJsonResponse({
                supabaseServiceRoleConfigured: false,
                fanClubInsertBlockedByRlsWithoutServiceRole: true,
                sqlPolicyFile: 'server/sql/fan_clubes_policies.sql',
                source: 'supabase-direct-frontend'
            });
        }

        if (method === 'POST' && path === '/api/auth/login') {
            return supabaseLogin(options);
        }

        if (method === 'POST' && path === '/api/cadastros/user') {
            return supabaseRegister(options);
        }

        if (method === 'POST' && path === '/api/auth/reset-password') {
            return supabaseResetPassword(options);
        }

        if (method === 'GET' && path === '/api/cadastros/pessoas') {
            return supabaseListPessoas(normalizedEndpoint, options);
        }

        if (method === 'GET' && (path === '/api/cadastros/fan-clubes' || path === '/api/cadastros/fan_clubes')) {
            return supabaseListFanClubes(normalizedEndpoint, options);
        }

        if (method === 'POST' && (path === '/api/cadastros/fan-clubes' || path === '/api/cadastros/fan_clubes')) {
            return supabaseCreateFanClube(options);
        }

        if (method === 'DELETE' && path.startsWith('/api/cadastros/pessoas/')) {
            return supabaseDeletePessoa(path, options);
        }

        if (method === 'DELETE' && (path.startsWith('/api/cadastros/fan-clubes/') || path.startsWith('/api/cadastros/fan_clubes/'))) {
            return supabaseDeleteFanClube(path, options);
        }

        return createJsonResponse({ message: 'Rota não implementada no modo Supabase direto.' }, 404);
    }

    async function request(endpoint, options = {}) {
        const rawEndpoint = String(endpoint || '').trim();

        if (/^https?:\/\//i.test(rawEndpoint)) {
            return fetch(rawEndpoint, options);
        }

        const normalizedEndpoint = rawEndpoint.startsWith('/') ? rawEndpoint : `/${rawEndpoint}`;
        const candidates = getApiCandidates();
        let lastResponse = null;
        let lastError = null;

        for (const baseUrl of candidates) {
            if (looksLikeSupabaseUrl(baseUrl) && isApiEndpoint(normalizedEndpoint)) {
                continue;
            }

            const resolvedUrl = resolveEndpoint(normalizedEndpoint, baseUrl);

            try {
                const response = await fetch(resolvedUrl, buildRequestInit(options));

                if (!shouldRetryWithAnotherBase(response, normalizedEndpoint)) {
                    activeBaseUrl = baseUrl;
                    persistBaseUrl(baseUrl);
                    return response;
                }

                lastResponse = response;
            } catch (error) {
                lastError = error;
            }
        }

        const adapterResponse = await requestViaSupabaseAdapter(normalizedEndpoint, options);

        if (adapterResponse) {
            return adapterResponse;
        }

        if (lastResponse) {
            return lastResponse;
        }

        throw lastError || new Error('Não foi possível conectar à API.');
    }

    async function requestJson(endpoint, options = {}) {
        const response = await request(endpoint, options);
        let data = null;

        try {
            data = await response.json();
        } catch (error) {
            data = null;
        }

        return { response, data };
    }

    return {
        getBaseUrl,
        resolveEndpoint,
        request,
        requestJson
    };
})();
