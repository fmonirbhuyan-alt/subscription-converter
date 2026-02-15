/* Digital Freedom - Unified Backend v1.2.1 (Character Fix & Universal Protection) */
const BACKENDS = ['https://sub.x86.men', 'https://url.v1.mk', 'https://api.wuma.io'];
const SHORT_DOMAIN = 'https://s.digital-freedom.site';

export default {
    async fetch(request, env, ctx) {
        let url = new URL(request.url);
        const userAgent = request.headers.get('User-Agent') || '';
        const isVpnApp = /hiddify|shadowrocket|clash|v2ray|surfboard|stash|sing-box/i.test(userAgent);

        // 1. Version
        if (url.pathname === '/version') {
            return new Response('Digital Freedom v1.2.1', {
                headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
            });
        }

        let path = url.pathname;
        const isAdmin = path.endsWith('/AdMiN');
        const cleanPath = isAdmin ? path.replace('/AdMiN', '') : path;

        // Fixed Access Denied Template (Added charset)
        const accessDeniedHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Access Denied</title>
      </head>
      <body style="background:#0f0f0f; color:#ff4d4d; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; flex-direction:column; text-align:center;">
          <div style="border: 2px solid #ff4d4d; padding: 40px; border-radius: 15px; background: #1a1a1a; box-shadow: 0 0 20px rgba(255,77,77,0.3);">
            <h1 style="font-size:3rem; margin-bottom:10px;">🚫 ACCESS DENIED</h1>
            <p style="font-size:1.2rem; color:#888;">Direct browser access is strictly prohibited.</p>
            <p style="font-weight:bold; color:#00ff88; margin-top:20px; border:1px solid #00ff88; padding:15px; border-radius:8px; display:inline-block; letter-spacing:1px;">PLEASE USE YOUR APPLICATION</p>
          </div>
      </body>
      </html>`;

        // 2. Main Protection Logic
        if (cleanPath !== '/' && cleanPath !== '/health' && cleanPath !== '/short') {

            // UNIVERSAL PROTECTION
            if (!isVpnApp && !isAdmin) {
                return new Response(accessDeniedHtml, {
                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
                });
            }

            let finalLongUrl = '';
            if (cleanPath === '/sub') {
                finalLongUrl = request.url.replace('/AdMiN', '');
            } else {
                const code = cleanPath.substring(1);
                const storedUrl = await env.SHORT_URL_STORAGE.get(code);
                if (storedUrl) finalLongUrl = storedUrl;
            }

            if (finalLongUrl) {
                const targetUrl = new URL(finalLongUrl);
                if (targetUrl.hostname === 'api.digital-freedom.site') {
                    url.pathname = targetUrl.pathname;
                    url.search = targetUrl.search;
                } else {
                    const subResponse = await fetch(new Request(finalLongUrl, {
                        headers: request.headers,
                        method: 'GET',
                        redirect: 'follow'
                    }));

                    const newHeaders = new Headers(subResponse.headers);
                    newHeaders.delete('subscription-userinfo');
                    newHeaders.set('Access-Control-Allow-Origin', '*');

                    if (isAdmin) {
                        newHeaders.set('Content-Disposition', 'attachment; filename="DigitalFreedom.yml"');
                        newHeaders.set('Content-Type', 'application/octet-stream; charset=utf-8');
                    }

                    return new Response(subResponse.body, { status: subResponse.status, headers: newHeaders });
                }
            }
        }

        // 3. Short Link Generation
        if (url.pathname === '/short' && request.method === 'POST') {
            try {
                const formData = await request.formData();
                const rawLongUrl = formData.get('longUrl');
                const longUrl = atob(rawLongUrl);
                const code = Math.random().toString(36).substring(2, 7);
                await env.SHORT_URL_STORAGE.put(code, longUrl);
                return new Response(JSON.stringify({ Code: 1, ShortUrl: `${SHORT_DOMAIN}/${code}` }), {
                    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
                });
            } catch (e) { return new Response(JSON.stringify({ Code: 0, Message: e.message }), { status: 500 }); }
        }

        // 4. Default Gateway
        if (url.pathname === '/health' || url.pathname === '/') {
            return new Response('Digital Freedom Gateway Live', { status: 200 });
        }

        for (const backend of BACKENDS) {
            const proxyUrl = new URL(backend);
            proxyUrl.pathname = url.pathname;
            proxyUrl.search = url.search;
            try {
                const response = await fetch(new Request(proxyUrl, {
                    method: request.method,
                    headers: request.headers,
                    body: request.body,
                    redirect: 'follow'
                }));

                if (response.ok || response.status < 500) {
                    const proxyHeaders = new Headers(response.headers);
                    proxyHeaders.delete('subscription-userinfo');
                    proxyHeaders.set('Access-Control-Allow-Origin', '*');

                    if (isAdmin) {
                        proxyHeaders.set('Content-Disposition', 'attachment; filename="DigitalFreedom.yml"');
                        proxyHeaders.set('Content-Type', 'application/octet-stream; charset=utf-8');
                    }

                    return new Response(response.body, { status: response.status, headers: proxyHeaders });
                }
            } catch (e) { continue; }
        }
        return new Response('Gateway Error', { status: 503 });
    }
};
