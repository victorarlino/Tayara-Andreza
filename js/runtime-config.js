window.APP_CONFIG = window.APP_CONFIG || {};

// Defina aqui a URL pública do backend quando publicar o frontend no Google.
// Exemplo: window.APP_CONFIG.API_BASE_URL = 'https://tayara-api.onrender.com';
const host = String(window.location.hostname || '').toLowerCase();
const isLocalHost = host === 'localhost' || host === '127.0.0.1';
const productionApiBaseUrl = 'https://tayara-api.onrender.com';

window.APP_CONFIG.API_BASE_URL = window.APP_CONFIG.API_BASE_URL || (isLocalHost ? '' : productionApiBaseUrl);
