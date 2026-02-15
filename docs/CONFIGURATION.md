# Configuration Guide

## Frontend Configuration

### Environment Variables

Create `frontend/.env`:

```env
# API Endpoint
VUE_APP_API_URL=https://api.digital-freedom.site

# Site Branding
VUE_APP_SITE_NAME=Digital Freedom
VUE_APP_SITE_DESCRIPTION=Free Subscription Converter

# Optional: Analytics
VUE_APP_GA_ID=your-google-analytics-id
```

### Customizing Branding

Edit `frontend/src/App.vue` or relevant component files to change:
- Logo
- Colors
- Site name
- Footer text

---

## Worker Configuration

### Environment Variables

Edit `worker/wrangler.toml`:

```toml
[vars]
# Backend URL (Render.com)
BACKEND_URL = "https://your-app.onrender.com"

# Cache TTL (in seconds)
CACHE_TTL = "3600"  # 1 hour
```

### Custom Routes

To add custom routes, edit `worker/wrangler.toml`:

```toml
routes = [
  { pattern = "api.digital-freedom.site/*", zone_name = "digital-freedom.site" },
  { pattern = "converter.digital-freedom.site/*", zone_name = "digital-freedom.site" }
]
```

---

## Backend Configuration (Subconverter)

The backend runs on Render.com using Docker. Configuration is in the subconverter repository.

### Custom Rules

To add custom rules, you'll need to modify the subconverter configuration files:

1. Fork the subconverter repository
2. Edit `pref.ini` or `pref.toml` files
3. Redeploy on Render.com

Refer to: https://github.com/tindy2013/subconverter/blob/master/README-cn.md

---

## DNS Configuration

### Cloudflare DNS Records

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | sub | [pages-project].pages.dev | ✅ |
| CNAME | api | [worker].workers.dev | ✅ |

### SSL/TLS Settings

Recommended settings in Cloudflare:
- **SSL/TLS encryption mode**: Full (strict)
- **Always Use HTTPS**: On
- **Automatic HTTPS Rewrites**: On
- **Minimum TLS Version**: 1.2

---

## Advanced Configuration

### Rate Limiting

Add to `worker/index.js`:

```javascript
// Simple rate limiting (100 requests per minute per IP)
const rateLimiter = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= 100) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
  return true;
}
```

### Custom Cache Strategy

Edit `worker/index.js`:

```javascript
// Cache different content types differently
const CACHE_CONFIG = {
  'clash': 7200,    // 2 hours
  'surge': 7200,
  'v2ray': 3600,    // 1 hour
  'default': 3600
};
```

---

## Monitoring

### Cloudflare Analytics

- Go to Cloudflare Dashboard → Analytics
- Monitor:
  - Requests per day
  - Bandwidth usage
  - Cache hit ratio
  - Error rates

### Render.com Logs

- Go to Render Dashboard → Your service → Logs
- Monitor backend health and errors

---

## Backup & Recovery

### Backup Configuration

Regularly backup:
- `worker/wrangler.toml`
- `frontend/.env`
- Custom rule files

### Recovery

If something breaks:
1. Revert to last working commit in GitHub
2. Redeploy from Cloudflare/Render dashboard
3. Check logs for errors
