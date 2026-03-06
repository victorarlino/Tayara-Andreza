const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const cadastrosRoutes = require('./routes/cadastros');

dotenv.config();

function sanitizeEnvValue(value) {
    const raw = String(value || '').trim();

    if (!raw) {
        return '';
    }

    if (
        raw.startsWith('SEU_') ||
        raw.includes('SEU-PROJETO') ||
        raw.includes('SEU_SUPABASE')
    ) {
        return '';
    }

    return raw;
}

function normalizeSupabaseUrl(url) {
    const raw = String(url || '').trim();

    if (!raw) {
        return '';
    }

    try {
        const parsed = new URL(raw);
        return `${parsed.protocol}//${parsed.host}`;
    } catch (error) {
        return raw;
    }
}

const app = express();
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = normalizeSupabaseUrl(
    sanitizeEnvValue(process.env.SUPABASE_URL) ||
    'https://myyrzxvycljhcubyjaal.supabase.co'
);
const SUPABASE_ANON_KEY =
    sanitizeEnvValue(process.env.SUPABASE_ANON_KEY) ||
    sanitizeEnvValue(process.env.SUPABASE_PUBLISHABLE_KEY) ||
    sanitizeEnvValue(process.env.SUPABASE_API_KEY) ||
    sanitizeEnvValue(process.env.APIKEY) ||
    'sb_publishable_2EfqfV5GqNDtejVD5KF5sQ_fwuyxhL-';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.resolve(__dirname, '..')));

app.use('/api/auth', authRoutes);
app.use('/api/cadastros', cadastrosRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Variáveis SUPABASE_URL e SUPABASE_ANON_KEY (ou SUPABASE_PUBLISHABLE_KEY) são obrigatórias.');
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
