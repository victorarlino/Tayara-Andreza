const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY precisam estar definidos no ambiente.');
    }

    return createClient(supabaseUrl, supabaseAnonKey);
}

function getSupabaseAdminClient() {
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
    getSupabaseAdminClient
};