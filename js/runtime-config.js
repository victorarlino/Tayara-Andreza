window.APP_CONFIG = window.APP_CONFIG || {};

const host = String(window.location.hostname || '').toLowerCase();
const isLocalHost = host === 'localhost' || host === '127.0.0.1';
const supabaseUrl = 'https://myyrzxvycljhcubyjaal.supabase.co';
const supabaseAnonKey = 'sb_publishable_2EfqfV5GqNDtejVD5KF5sQ_fwuyxhL-';
const productionApiBaseUrl = supabaseUrl;

window.APP_CONFIG.API_BASE_URL = window.APP_CONFIG.API_BASE_URL || (isLocalHost ? '' : productionApiBaseUrl);
window.APP_CONFIG.API_BASE_URLS = window.APP_CONFIG.API_BASE_URLS || [productionApiBaseUrl];
window.APP_CONFIG.SUPABASE_URL = window.APP_CONFIG.SUPABASE_URL || supabaseUrl;
window.APP_CONFIG.SUPABASE_ANON_KEY = window.APP_CONFIG.SUPABASE_ANON_KEY || supabaseAnonKey;

try {
	const legacyApiBase = String(window.localStorage.getItem('fanClubApiBaseUrl') || '').toLowerCase();

	if (legacyApiBase.includes('tayara-api.onrender.com')) {
		window.localStorage.removeItem('fanClubApiBaseUrl');
	}
} catch (error) {
	// no-op
}
