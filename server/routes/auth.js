const express = require('express');
const { getSupabaseClient, getSupabaseAdminClient } = require('../supabase');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const {
            nome,
            nascimento,
            email,
            confirmarEmail,
            telefone,
            pais,
            estado,
            cidade,
            senha
        } = req.body;

        if (
            !nome ||
            !nascimento ||
            !email ||
            !confirmarEmail ||
            !telefone ||
            !estado ||
            !cidade ||
            !senha
        ) {
            return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
        }

        if (email.trim().toLowerCase() !== confirmarEmail.trim().toLowerCase()) {
            return res.status(400).json({ message: 'Os e-mails não conferem.' });
        }

        if (senha.length < 6) {
            return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
        }

        const emailNormalizado = email.trim().toLowerCase();
        const supabase = getSupabaseClient();

        const { error } = await supabase.auth.signUp({
            email: emailNormalizado,
            password: senha,
            options: {
                data: {
                    nome: nome.trim(),
                    nascimento: nascimento.trim(),
                    telefone: telefone.trim(),
                    pais: (pais || 'Brasil').trim(),
                    estado: estado.trim(),
                    cidade: cidade.trim()
                }
            }
        });

        if (error) {
            if (error.message.toLowerCase().includes('already registered')) {
                return res.status(409).json({ message: 'Já existe uma conta com este e-mail.' });
            }

            return res.status(400).json({ message: error.message });
        }

        return res.status(201).json({ message: 'Conta criada com sucesso!' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno ao criar conta.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: 'Informe e-mail e senha.' });
        }

        const supabase = getSupabaseClient();
        const emailNormalizado = email.trim().toLowerCase();

        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailNormalizado,
            password: senha
        });

        if (error || !data.user) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        return res.json({
            message: 'Login realizado com sucesso!',
            user: {
                id: data.user.id,
                email: data.user.email,
                nome: data.user.user_metadata?.nome || ''
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno ao realizar login.' });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { email, confirmarEmail, novaSenha, confirmarNovaSenha } = req.body;

        if (!email || !confirmarEmail || !novaSenha || !confirmarNovaSenha) {
            return res.status(400).json({ message: 'Preencha todos os campos.' });
        }

        if (email.trim().toLowerCase() !== confirmarEmail.trim().toLowerCase()) {
            return res.status(400).json({ message: 'Os e-mails não conferem.' });
        }

        if (novaSenha !== confirmarNovaSenha) {
            return res.status(400).json({ message: 'As senhas não conferem.' });
        }

        if (novaSenha.length < 6) {
            return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
        }

        const emailNormalizado = email.trim().toLowerCase();
        const supabaseAdmin = getSupabaseAdminClient();
        const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

        if (usersError) {
            return res.status(500).json({ message: 'Erro ao consultar usuários no Supabase.' });
        }

        const user = usersData.users.find((item) => item.email?.toLowerCase() === emailNormalizado);

        if (!user) {
            return res.status(404).json({ message: 'Conta não encontrada para este e-mail.' });
        }

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
            password: novaSenha
        });

        if (updateError) {
            return res.status(500).json({ message: 'Erro ao atualizar senha no Supabase.' });
        }

        return res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro interno ao alterar senha.' });
    }
});

module.exports = router;
