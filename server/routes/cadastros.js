const express = require('express');
const {
    getSupabaseAdminClient,
    getSupabaseClient,
    getSupabaseClientWithAccessToken,
    hasSupabaseServiceRoleKey
} = require('../supabase');

const router = express.Router();
const ADMIN_CONSULTA_EMAIL = 'victorduartearlino2210@gmail.com';

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
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

function containsFilter(value, filter) {
    if (!filter) {
        return true;
    }

    return String(value || '').toLowerCase().includes(String(filter || '').toLowerCase());
}

function getBearerToken(req) {
    const authorizationHeader = String(req.headers.authorization || '').trim();

    if (!authorizationHeader.toLowerCase().startsWith('bearer ')) {
        return '';
    }

    return authorizationHeader.slice(7).trim();
}

async function ensureAdminAccess(req) {
    const accessToken = getBearerToken(req);

    if (!accessToken) {
        return {
            ok: false,
            status: 401,
            message: 'Sessão inválida. Faça login novamente.'
        };
    }

    try {
        const tokenClient = getSupabaseClientWithAccessToken(accessToken);
        const { data, error } = await tokenClient.auth.getUser(accessToken);

        if (error || !data?.user?.email) {
            return {
                ok: false,
                status: 401,
                message: 'Não foi possível validar a sessão do usuário.'
            };
        }

        if (normalizeEmail(data.user.email) !== ADMIN_CONSULTA_EMAIL) {
            return {
                ok: false,
                status: 403,
                message: 'Acesso negado. Apenas administrador pode excluir registros.'
            };
        }

        return {
            ok: true,
            accessToken
        };
    } catch (error) {
        return {
            ok: false,
            status: 401,
            message: 'Sessão inválida ou expirada.'
        };
    }
}

router.get('/diagnostico/supabase', (req, res) => {
    return res.status(200).json({
        supabaseServiceRoleConfigured: hasSupabaseServiceRoleKey(),
        fanClubInsertBlockedByRlsWithoutServiceRole: !hasSupabaseServiceRoleKey(),
        sqlPolicyFile: 'server/sql/fan_clubes_policies.sql'
    });
});

router.get('/pessoas', async (req, res) => {
    try {
        const { nome, email, cidade, estado, limit } = req.query;
        const supabase = getSupabaseClient();

        let query = supabase
            .from('pessoas')
            .select('id, user_id, nome_completo, data_nascimento, email, telefone, pais, estado, cidade, created_at')
            .order('created_at', { ascending: false });

        if (nome) {
            query = query.ilike('nome_completo', `%${String(nome).trim()}%`);
        }

        if (email) {
            query = query.ilike('email', `%${String(email).trim()}%`);
        }

        if (cidade) {
            query = query.ilike('cidade', `%${String(cidade).trim()}%`);
        }

        if (estado) {
            query = query.ilike('estado', `%${String(estado).trim()}%`);
        }

        const safeLimit = Number.isFinite(Number(limit))
            ? Math.min(Math.max(Number(limit), 1), 200)
            : 100;

        query = query.limit(safeLimit);

        const { data, error } = await query;

        if (error) {
            return res.status(400).json({ message: `Não foi possível consultar pessoas: ${error.message}` });
        }

        const pessoasTabela = Array.isArray(data) ? data : [];
        const emailMap = new Map();

        pessoasTabela.forEach((pessoa) => {
            emailMap.set(normalizeEmail(pessoa.email), {
                id: pessoa.id,
                user_id: pessoa.user_id,
                nome: pessoa.nome_completo,
                email: pessoa.email,
                telefone: pessoa.telefone,
                nascimento: pessoa.data_nascimento,
                pais: pessoa.pais,
                estado: pessoa.estado,
                cidade: pessoa.cidade,
                created_at: pessoa.created_at
            });
        });

        let users = [];

        try {
            const supabaseAdmin = getSupabaseAdminClient();

            if (supabaseAdmin.auth?.admin?.listUsers) {
                const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
                    page: 1,
                    perPage: safeLimit
                });

                if (!usersError) {
                    users = usersData?.users || [];
                }
            }
        } catch (authError) {
            users = [];
        }

        users.forEach((user) => {
            const userEmail = normalizeEmail(user.email);

            if (!userEmail || emailMap.has(userEmail)) {
                return;
            }

            const metadata = user.user_metadata || {};

            emailMap.set(userEmail, {
                id: user.id,
                user_id: user.id,
                nome: metadata.nome || userEmail.split('@')[0],
                email: user.email || userEmail,
                telefone: metadata.telefone || null,
                nascimento: metadata.nascimento || null,
                pais: metadata.pais || 'Brasil',
                estado: metadata.estado || null,
                cidade: metadata.cidade || null,
                created_at: user.created_at || null
            });
        });

        let pessoas = Array.from(emailMap.values());

        pessoas = pessoas.filter((pessoa) => (
            containsFilter(pessoa.nome, nome) &&
            containsFilter(pessoa.email, email) &&
            containsFilter(pessoa.cidade, cidade) &&
            containsFilter(pessoa.estado, estado)
        ));

        pessoas.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
        });

        pessoas = pessoas.slice(0, safeLimit);

        return res.json({ total: pessoas.length, pessoas });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro interno ao consultar pessoas.',
            detail: error?.message || 'Erro desconhecido'
        });
    }
});

router.get(['/fan-clubes', '/fan_clubes'], async (req, res) => {
    try {
        const { nome, email, cidade, estado, limit } = req.query;
        const safeLimit = Number.isFinite(Number(limit))
            ? Math.min(Math.max(Number(limit), 1), 200)
            : 100;
        const authorizationHeader = String(req.headers.authorization || '').trim();
        const accessToken = authorizationHeader.toLowerCase().startsWith('bearer ')
            ? authorizationHeader.slice(7).trim()
            : '';

        let dbClient = null;

        try {
            dbClient = getSupabaseAdminClient();
        } catch (adminError) {
            dbClient = accessToken
                ? getSupabaseClientWithAccessToken(accessToken)
                : getSupabaseClient();
        }

        let query = dbClient
            .from('fan_clubes')
            .select('id, pessoa_id, email, responsavel, nome_fa_clube, cidade, estado, instagram, tiktok, created_at')
            .order('created_at', { ascending: false })
            .limit(safeLimit);

        if (nome) {
            query = query.ilike('nome_fa_clube', `%${String(nome).trim()}%`);
        }

        if (email) {
            query = query.ilike('email', `%${String(email).trim()}%`);
        }

        if (cidade) {
            query = query.ilike('cidade', `%${String(cidade).trim()}%`);
        }

        if (estado) {
            query = query.ilike('estado', `%${String(estado).trim()}%`);
        }

        const { data, error } = await query;

        if (error) {
            const errorMessage = String(error.message || '').toLowerCase();
            const isRlsError =
                error.code === '42501' ||
                errorMessage.includes('row-level security') ||
                errorMessage.includes('violates row-level security policy');

            if (isRlsError) {
                return res.status(403).json({
                    message: 'Permissão negada no Supabase (RLS) para consultar fã clubes. Configure SUPABASE_SERVICE_ROLE_KEY no backend ou crie policy de SELECT para fan_clubes.'
                });
            }

            return res.status(400).json({ message: `Não foi possível consultar fã clubes: ${error.message}` });
        }

        const fanClubes = (Array.isArray(data) ? data : []).map((fanClube) => ({
            id: fanClube.id,
            pessoa_id: fanClube.pessoa_id,
            nome: fanClube.nome_fa_clube,
            email: fanClube.email,
            responsavel: fanClube.responsavel,
            cidade: fanClube.cidade,
            estado: fanClube.estado,
            instagram: fanClube.instagram,
            tiktok: fanClube.tiktok,
            created_at: fanClube.created_at
        }));

        return res.json({ total: fanClubes.length, fanClubes });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro interno ao consultar fã clubes.',
            detail: error?.message || 'Erro desconhecido'
        });
    }
});

router.post('/user', async (req, res) => {
    try {
        const {
            nome,
            email,
            senha,
            telefone,
            nascimento,
            pais,
            estado,
            cidade
        } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ message: 'nome, email e senha são obrigatórios.' });
        }

        if (String(senha).length < 6) {
            return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
        }

        let supabaseAdmin = null;
        const supabase = getSupabaseClient();
        const emailNormalizado = normalizeEmail(email);

        try {
            supabaseAdmin = getSupabaseAdminClient();
        } catch (adminError) {
            supabaseAdmin = null;
        }

        let userData = null;
        let userError = null;

        if (supabaseAdmin) {
            const adminResult = await supabaseAdmin.auth.admin.createUser({
                email: emailNormalizado,
                password: senha,
                email_confirm: true,
                user_metadata: {
                    nome: String(nome).trim()
                }
            });

            userData = adminResult.data;
            userError = adminResult.error;
        } else {
            const signUpResult = await supabase.auth.signUp({
                email: emailNormalizado,
                password: senha,
                options: {
                    data: {
                        nome: String(nome).trim(),
                        telefone: telefone ? String(telefone).trim() : null,
                        nascimento: nascimento ? String(nascimento).trim() : null,
                        pais: pais ? String(pais).trim() : 'Brasil',
                        estado: estado ? String(estado).trim() : null,
                        cidade: cidade ? String(cidade).trim() : null
                    }
                }
            });

            userData = signUpResult.data;
            userError = signUpResult.error;
        }

        if (userError || !userData?.user) {
            if (userError?.message?.toLowerCase().includes('already')) {
                return res.status(409).json({ message: 'Já existe uma conta com este e-mail.' });
            }

            return res.status(400).json({ message: userError?.message || 'Não foi possível cadastrar user.' });
        }

        const pessoaPayload = {
            user_id: userData.user.id,
            nome_completo: String(nome).trim(),
            data_nascimento: normalizeDate(nascimento),
            email: emailNormalizado,
            telefone: telefone ? String(telefone).trim() : null,
            pais: pais ? String(pais).trim() : 'Brasil',
            estado: estado ? String(estado).trim() : null,
            cidade: cidade ? String(cidade).trim() : null
        };

        const clientForPessoa = supabaseAdmin || supabase;

        const { data: pessoaData, error: pessoaError } = await clientForPessoa
            .from('pessoas')
            .insert(pessoaPayload)
            .select()
            .single();

        if (pessoaError && supabaseAdmin) {
            await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
            return res.status(500).json({ message: `User criado, mas falhou ao cadastrar pessoa: ${pessoaError.message}` });
        }

        if (pessoaError) {
            return res.status(500).json({ message: `User criado, mas falhou ao cadastrar pessoa: ${pessoaError.message}` });
        }

        let accessToken = null;

        try {
            const signInResult = await supabase.auth.signInWithPassword({
                email: emailNormalizado,
                password: senha
            });

            if (!signInResult.error) {
                accessToken = signInResult.data?.session?.access_token || null;
            }
        } catch (signInError) {
            accessToken = null;
        }

        return res.status(201).json({
            message: 'User e pessoa cadastrados com sucesso!',
            user: {
                id: userData.user.id,
                email: userData.user.email
            },
            pessoa: pessoaData,
            session: {
                accessToken
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro interno ao cadastrar user.',
            detail: error?.message || 'Erro desconhecido'
        });
    }
});

router.post('/pessoa', async (req, res) => {
    try {
        const {
            userId,
            nome,
            email,
            telefone,
            nascimento,
            pais,
            estado,
            cidade
        } = req.body;

        if (!userId || !nome || !email) {
            return res.status(400).json({ message: 'userId, nome e email são obrigatórios para pessoa.' });
        }

        const emailNormalizado = normalizeEmail(email);
        const supabaseAdmin = getSupabaseAdminClient();

        const payload = {
            user_id: String(userId).trim(),
            nome_completo: String(nome).trim(),
            data_nascimento: normalizeDate(nascimento),
            email: emailNormalizado,
            telefone: telefone ? String(telefone).trim() : null,
            pais: pais ? String(pais).trim() : 'Brasil',
            estado: estado ? String(estado).trim() : null,
            cidade: cidade ? String(cidade).trim() : null
        };

        const { data, error } = await supabaseAdmin
            .from('pessoas')
            .upsert(payload, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ message: `Não foi possível cadastrar pessoa: ${error.message}` });
        }

        return res.status(201).json({ message: 'Pessoa cadastrada com sucesso!', pessoa: data });
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno ao cadastrar pessoa.' });
    }
});

router.post(['/fan-clubes', '/fan_clubes'], async (req, res) => {
    try {
        const {
            pessoaId,
            email,
            nome,
            url,
            dataFundacao,
            estado,
            cidade,
            responsavel,
            telefoneContato,
            senha,
            instagramUrl,
            tiktokUrl,
            descricao
        } = req.body;

        if (!nome || !instagramUrl || !tiktokUrl) {
            return res.status(400).json({ message: 'nome, instagramUrl e tiktokUrl são obrigatórios.' });
        }

        let supabaseAdmin = null;
        let dbClient = null;
        const authorizationHeader = String(req.headers.authorization || '').trim();
        const accessToken = authorizationHeader.toLowerCase().startsWith('bearer ')
            ? authorizationHeader.slice(7).trim()
            : '';

        try {
            supabaseAdmin = getSupabaseAdminClient();
            dbClient = supabaseAdmin;
        } catch (adminError) {
            dbClient = accessToken
                ? getSupabaseClientWithAccessToken(accessToken)
                : getSupabaseClient();
        }

        let resolvedPessoaId = pessoaId || null;

        if (!resolvedPessoaId) {
            const emailNormalizado = normalizeEmail(email);

            if (!emailNormalizado) {
                return res.status(400).json({ message: 'Informe pessoaId ou email para vincular o fã clube.' });
            }

            const { data: pessoaData, error: pessoaError } = await dbClient
                .from('pessoas')
                .select('id, nome_completo')
                .eq('email', emailNormalizado)
                .order('created_at', { ascending: false })
                .limit(1);

            if (pessoaError) {
                return res.status(400).json({ message: `Erro ao localizar pessoa: ${pessoaError.message}` });
            }

            const pessoa = Array.isArray(pessoaData) ? pessoaData[0] : pessoaData;

            if (!pessoa?.id) {
                return res.status(404).json({ message: 'Pessoa não encontrada para o e-mail informado.' });
            }

            resolvedPessoaId = pessoa.id;

            if (!responsavel && pessoa.nome_completo) {
                req.body.responsavel = pessoa.nome_completo;
            }
        }

        const responsavelNome = String(req.body.responsavel || responsavel || '').trim();

        if (!responsavelNome) {
            return res.status(400).json({ message: 'responsavel é obrigatório para cadastrar fã clube.' });
        }

        const emailNormalizado = normalizeEmail(email);

        if (!emailNormalizado) {
            return res.status(400).json({ message: 'email é obrigatório para cadastrar fã clube.' });
        }

        const payload = {
            pessoa_id: resolvedPessoaId,
            email: emailNormalizado,
            senha: senha ? String(senha).trim() : null,
            telefone_contato: telefoneContato ? String(telefoneContato).trim() : null,
            responsavel: responsavelNome,
            nome_fa_clube: String(nome).trim(),
            url_fa_clube: url ? String(url).trim() : null,
            data_fundacao: normalizeDate(dataFundacao),
            estado: estado ? String(estado).trim() : null,
            cidade: cidade ? String(cidade).trim() : null,
            instagram: String(instagramUrl).trim(),
            tiktok: String(tiktokUrl).trim(),
            descricao: descricao ? String(descricao).trim() : null
        };

        const { data, error } = await dbClient
            .from('fan_clubes')
            .insert(payload)
            .select()
            .single();

        if (error) {
            const errorMessage = String(error.message || '').toLowerCase();
            const errorDetails = String(error.details || '').toLowerCase();
            const errorHint = String(error.hint || '').toLowerCase();

            const isRlsError =
                error.code === '42501' ||
                errorMessage.includes('row-level security') ||
                errorMessage.includes('violates row-level security policy') ||
                errorDetails.includes('row-level security') ||
                errorHint.includes('row-level security');

            if (isRlsError) {
                return res.status(403).json({
                    message: 'Permissão negada no Supabase (RLS) para cadastrar fã clube. Faça login novamente para renovar sessão, configure SUPABASE_SERVICE_ROLE_KEY no backend ou execute o SQL de policy em server/sql/fan_clubes_policies.sql.'
                });
            }

            return res.status(400).json({ message: `Não foi possível cadastrar fã clube: ${error.message}` });
        }

        return res.status(201).json({ message: 'Fã clube cadastrado com sucesso!', fanClube: data });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro interno ao cadastrar fã clube.',
            detail: error?.message || 'Erro desconhecido'
        });
    }
});

router.delete('/pessoas/:id', async (req, res) => {
    try {
        const authCheck = await ensureAdminAccess(req);

        if (!authCheck.ok) {
            return res.status(authCheck.status).json({ message: authCheck.message });
        }

        const id = String(req.params.id || '').trim();

        if (!id) {
            return res.status(400).json({ message: 'id da pessoa é obrigatório.' });
        }

        let dbClient = null;

        try {
            dbClient = getSupabaseAdminClient();
        } catch (adminError) {
            dbClient = getSupabaseClientWithAccessToken(authCheck.accessToken);
        }

        const { data: pessoaData, error: pessoaFindError } = await dbClient
            .from('pessoas')
            .select('id')
            .eq('id', id)
            .limit(1);

        if (pessoaFindError) {
            return res.status(400).json({ message: `Não foi possível localizar pessoa: ${pessoaFindError.message}` });
        }

        if (!Array.isArray(pessoaData) || !pessoaData.length) {
            return res.status(404).json({ message: 'Pessoa não encontrada ou não cadastrada na tabela pessoas.' });
        }

        const { error: fanClubDeleteError } = await dbClient
            .from('fan_clubes')
            .delete()
            .eq('pessoa_id', id);

        if (fanClubDeleteError) {
            return res.status(400).json({ message: `Não foi possível excluir fã clubes vinculados: ${fanClubDeleteError.message}` });
        }

        const { data: pessoaDeleted, error: pessoaDeleteError } = await dbClient
            .from('pessoas')
            .delete()
            .eq('id', id)
            .select('id');

        if (pessoaDeleteError) {
            return res.status(400).json({ message: `Não foi possível excluir pessoa: ${pessoaDeleteError.message}` });
        }

        if (!Array.isArray(pessoaDeleted) || !pessoaDeleted.length) {
            return res.status(404).json({ message: 'Pessoa não encontrada para exclusão.' });
        }

        return res.json({ message: 'Pessoa excluída com sucesso.' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno ao excluir pessoa.' });
    }
});

router.delete(['/fan-clubes/:id', '/fan_clubes/:id'], async (req, res) => {
    try {
        const authCheck = await ensureAdminAccess(req);

        if (!authCheck.ok) {
            return res.status(authCheck.status).json({ message: authCheck.message });
        }

        const id = String(req.params.id || '').trim();

        if (!id) {
            return res.status(400).json({ message: 'id do fã clube é obrigatório.' });
        }

        let dbClient = null;

        try {
            dbClient = getSupabaseAdminClient();
        } catch (adminError) {
            dbClient = getSupabaseClientWithAccessToken(authCheck.accessToken);
        }

        const { data: existingRows, error: existingError } = await dbClient
            .from('fan_clubes')
            .select('id')
            .eq('id', id)
            .limit(1);

        if (existingError) {
            return res.status(400).json({ message: `Não foi possível localizar fã clube: ${existingError.message}` });
        }

        if (!Array.isArray(existingRows) || !existingRows.length) {
            return res.status(404).json({ message: 'Fã clube não encontrado para exclusão.' });
        }

        const { data: deletedRows, error } = await dbClient
            .from('fan_clubes')
            .delete()
            .eq('id', id)
            .select('id');

        if (error) {
            return res.status(400).json({ message: `Não foi possível excluir fã clube: ${error.message}` });
        }

        if (!Array.isArray(deletedRows) || !deletedRows.length) {
            return res.status(403).json({
                message: 'Permissão negada para excluir fã clube (RLS). Execute as policies de DELETE em server/sql/fan_clubes_policies.sql ou configure SUPABASE_SERVICE_ROLE_KEY no backend.'
            });
        }

        return res.json({ message: 'Fã clube excluído com sucesso.' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno ao excluir fã clube.' });
    }
});

module.exports = router;
