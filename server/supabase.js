const { createClient } = require('@supabase/supabase-js');

const DEFAULT_SUPABASE_URL = 'https://myyrzxvycljhcubyjaal.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_2EfqfV5GqNDtejVD5KF5sQ_fwuyxhL-';

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
    const raw = sanitizeEnvValue(url);

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

function getEnvValues() {
    const supabaseUrl = normalizeSupabaseUrl(
        sanitizeEnvValue(process.env.SUPABASE_URL) ||
        DEFAULT_SUPABASE_URL
    );
    const supabaseAnonKey =
        sanitizeEnvValue(process.env.SUPABASE_ANON_KEY) ||
        sanitizeEnvValue(process.env.SUPABASE_PUBLISHABLE_KEY) ||
        sanitizeEnvValue(process.env.SUPABASE_API_KEY) ||
        sanitizeEnvValue(process.env.APIKEY) ||
        DEFAULT_SUPABASE_PUBLISHABLE_KEY;
    const supabaseServiceRoleKey = sanitizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

    return {
        supabaseUrl,
        supabaseAnonKey,
        supabaseServiceRoleKey
    };
}

function getSupabaseClient() {
    const { supabaseUrl, supabaseAnonKey } = getEnvValues();

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY (ou SUPABASE_PUBLISHABLE_KEY) precisam estar definidos no ambiente.');
    }

    return createClient(supabaseUrl, supabaseAnonKey);
}

function getSupabaseClientWithAccessToken(accessToken) {
    const { supabaseUrl, supabaseAnonKey } = getEnvValues();

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY (ou SUPABASE_PUBLISHABLE_KEY) precisam estar definidos no ambiente.');
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${String(accessToken || '').trim()}`
            }
        }
    });
}

function hasSupabaseServiceRoleKey() {
    const { supabaseServiceRoleKey } = getEnvValues();
    return Boolean(supabaseServiceRoleKey);
}

function getSupabaseAdminClient() {
    const { supabaseUrl, supabaseServiceRoleKey } = getEnvValues();

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidos no ambiente.');
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

module.exports = {
    getSupabaseClient,
    getSupabaseClientWithAccessToken,
    getSupabaseAdminClient,
    hasSupabaseServiceRoleKey
};