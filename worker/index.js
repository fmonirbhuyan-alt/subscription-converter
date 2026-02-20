import { Router } from 'itty-router';

// Create a new router
const router = Router();

// Backend subconverter URL (will be configured in wrangler.toml)
// const BACKEND_URL = 'https://digital-freedom-backend.onrender.com';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Cache configuration
const CACHE_TTL = 3600; // 1 hour

/**
 * Handle OPTIONS request for CORS
 */
function handleOptions() {
    return new Response(null, {
        headers: corsHeaders,
    });
}

/**
 * Proxy request to backend subconverter
 */
async function proxyToBackend(request, env) {
    try {
        const url = new URL(request.url);

        // Build backend URL with query parameters using environment variable
        const backendUrl = `${env.BACKEND_URL}${url.pathname}${url.search}`;

        // Check cache first
        const cache = caches.default;
        let response = await cache.match(backendUrl);

        if (!response) {
            // Not in cache, fetch from backend
            console.log('Cache miss, fetching from backend:', backendUrl);

            response = await fetch(backendUrl, {
                method: request.method,
                headers: request.headers,
            });

            // Clone response to cache it
            const responseToCache = response.clone();

            // Only cache successful responses
            if (response.ok) {
                // Add cache headers
                const headers = new Headers(responseToCache.headers);
                headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`);

                const cachedResponse = new Response(responseToCache.body, {
                    status: responseToCache.status,
                    statusText: responseToCache.statusText,
                    headers: headers,
                });

                // Store in cache
                await cache.put(backendUrl, cachedResponse);
            }
        } else {
            console.log('Cache hit:', backendUrl);
        }

        // Add CORS headers to response
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
            headers.set(key, value);
        });

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers,
        });

    } catch (error) {
        console.error('Error proxying request:', error);

        return new Response(
            JSON.stringify({
                error: 'Backend service unavailable',
                message: error.message,
                hint: 'The backend service might be starting up (cold start). Please try again in 30 seconds.'
            }),
            {
                status: 503,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            }
        );
    }
}

/**
 * Health check endpoint
 */
function handleHealthCheck(request, env) {
    return new Response(
        JSON.stringify({
            status: 'ok',
            service: 'Digital Freedom Subscription Converter',
            version: '1.0.0',
            backend: env.BACKEND_URL,
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
        }
    );
}

// Routes
router.options('*', handleOptions);
router.get('/health', handleHealthCheck);
router.get('/sub', proxyToBackend);
router.post('/sub', proxyToBackend);
router.get('/*', proxyToBackend);

// 404 handler
router.all('*', () => new Response('Not Found', {
    status: 404,
    headers: corsHeaders,
}));

// Main worker entry point
export default {
    async fetch(request, env, ctx) {
        return router.handle(request, env, ctx);
    },
};
