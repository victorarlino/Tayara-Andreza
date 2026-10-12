(function applyLegacyApiFetchGuard() {
    const BLOCKED_HOST = 'tayara-api.onrender.com';
    const originalFetch = window.fetch.bind(window);

    function tryParseUrl(input) {
        try {
            if (typeof input === 'string') {
                return new URL(input, window.location.origin);
            }

            if (input instanceof URL) {
                return input;
            }

            if (input && typeof input.url === 'string') {
                return new URL(input.url, window.location.origin);
            }
        } catch (error) {
            return null;
        }

        return null;
    }

    window.fetch = function guardedFetch(input, init) {
        const parsedUrl = tryParseUrl(input);

        if (!parsedUrl) {
            return originalFetch(input, init);
        }

        const host = String(parsedUrl.hostname || '').toLowerCase();

        if (host !== BLOCKED_HOST) {
            return originalFetch(input, init);
        }

        const endpoint = `${parsedUrl.pathname}${parsedUrl.search || ''}`;

        if (window.APP_API && typeof window.APP_API.request === 'function') {
            return window.APP_API.request(endpoint, init || {});
        }

        return originalFetch(input, init);
    };
})();
