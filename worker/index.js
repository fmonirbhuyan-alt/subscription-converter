/* Digital Freedom - Unified Backend v1.2.6 (Stable) */
const BACKENDS = ['https://api.asailor.org', 'https://sub-api.nanako.vip', 'https://sub.asailor.org'];
const SHORT_DOMAIN = 'https://s.digital-freedom.site';

export default {
    async fetch(request, env, ctx) {
        let url = new URL(request.url);
        const originalUserAgent = request.headers.get('User-Agent') || '';
        const isVpnApp = /hiddify|shadowrocket|clash|v2ray|v2rayng|surfboard|stash|sing-box|quantumult|cfnetwork|dart|okhttp|ios/i.test(originalUserAgent) || originalUserAgent.trim() === '';

        if (url.pathname === '/version') {
            return new Response('Digital Freedom v1.2.6', {
                headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
            });
        }

        let path = url.pathname;
        const isAdmin = path.endsWith('/AdMiN');
        const cleanPath = isAdmin ? path.replace('/AdMiN', '') : path;

        if (cleanPath !== '/' && cleanPath !== '/health' && cleanPath !== '/short') {
            if (!isVpnApp && !isAdmin) {
                return new Response('Access Denied: Direct browser access prohibited.', { status: 403, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
            }

            let finalLongUrl = '';
            if (cleanPath === '/sub') {
                finalLongUrl = request.url.replace('/AdMiN', '');
            } else {
                const code = cleanPath.substring(1);
                if (env.SHORT_URL_STORAGE) {
                    const storedUrl = await env.SHORT_URL_STORAGE.get(code);
                    if (storedUrl) finalLongUrl = storedUrl;
                }
            }

            if (finalLongUrl) {
                const targetUrl = new URL(finalLongUrl);
                if (targetUrl.hostname === 'api.digital-freedom.site') {
                    url.pathname = targetUrl.pathname;
                    url.search = targetUrl.search;
                } else {
                    const fetchHeaders = new Headers(request.headers);
                    fetchHeaders.set('User-Agent', 'v2rayNG/1.8.8');
                    const subResponse = await fetch(new Request(finalLongUrl, { headers: fetchHeaders, method: 'GET', redirect: 'follow' }));
                    const responseBody = await subResponse.text();
                    const newHeaders = new Headers();
                    newHeaders.set('Access-Control-Allow-Origin', '*');
                    newHeaders.set('Content-Type', 'text/plain; charset=utf-8');
                    if (isAdmin) newHeaders.set('Content-Disposition', 'attachment; filename="config.yml"');
                    return new Response(responseBody, { status: subResponse.status, headers: newHeaders });
                }
            }
        }

        if (url.pathname === '/short' && request.method === 'POST') {
            try {
                const formData = await request.formData();
                const rawLongUrl = formData.get('longUrl');
                const longUrl = atob(rawLongUrl);
                const code = Math.random().toString(36).substring(2, 7);
                if (env.SHORT_URL_STORAGE) {
                    await env.SHORT_URL_STORAGE.put(code, longUrl);
                    return new Response(JSON.stringify({ Code: 1, ShortUrl: `${SHORT_DOMAIN}/${code}` }), {
                        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
                    });
                }
            } catch (e) { return new Response(e.message, { status: 500 }); }
        }

        if (url.pathname === '/sub') {
            for (const backend of BACKENDS) {
                const proxyUrl = new URL(backend);
                proxyUrl.pathname = '/sub';
                proxyUrl.search = url.search;
                try {
                    const response = await fetch(new Request(proxyUrl, { method: 'GET', headers: { 'User-Agent': 'v2rayNG/1.8.8' }, redirect: 'follow' }));
                    if (response.ok) {
                        const responseData = await response.text();
                        if (responseData.includes('No nodes') || responseData.trim().length < 10) continue;
                        const proxyHeaders = new Headers();
                        proxyHeaders.set('Access-Control-Allow-Origin', '*');
                        proxyHeaders.set('Content-Type', 'text/plain; charset=utf-8');
                        if (isAdmin) proxyHeaders.set('Content-Disposition', 'attachment; filename="config.yml"');
                        return new Response(responseData, { status: 200, headers: proxyHeaders });
                    }
                } catch (e) { continue; }
            }

            const rawUrlParam = url.searchParams.get('url');
            const targetParam = url.searchParams.get('target') || 'v2ray';
            if (rawUrlParam && isVpnApp) {
                try {
                    const urls = rawUrlParam.split('|');
                    let combinedText = '';
                    for (const singleUrl of urls) {
                        const fallbackResponse = await fetch(new Request(singleUrl, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'v2rayNG/1.8.8' } }));
                        if (fallbackResponse.ok) combinedText += (await fallbackResponse.text()) + '\n';
                    }
                    if (combinedText.trim()) {
                        let finalBody = combinedText.trim();
                        if (targetParam !== 'clash' && (finalBody.includes('://') || finalBody.includes('vmess'))) {
                            finalBody = btoa(combinedText.trim());
                        }
                        const fallbackHeaders = new Headers();
                        fallbackHeaders.set('Access-Control-Allow-Origin', '*');
                        fallbackHeaders.set('Content-Type', 'text/plain; charset=utf-8');
                        return new Response(finalBody, { status: 200, headers: fallbackHeaders });
                    }
                } catch (e) { }
            }
            return new Response('Gateway Error - SUB_FAIL', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' } });
        }

        return new Response('Gateway Live', { status: 200 });
    }
};
