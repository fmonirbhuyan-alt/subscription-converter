# Deployment Guide - Digital Freedom Subscription Converter

This guide will walk you through deploying the complete subscription converter system.

## Prerequisites

- ✅ Cloudflare account (free)
- ✅ Render.com account (free)
- ✅ GitHub account
- ✅ Domain `digital-freedom.site` added to Cloudflare
- ✅ Node.js installed (for local testing)

---

## Part 1: Deploy Backend (Render.com)

### Step 1: Fork Subconverter Repository

1. Go to: https://github.com/tindy2013/subconverter
2. Click **Fork** button (top right)
3. Fork to your GitHub account

### Step 2: Deploy on Render.com

1. Go to: https://render.com
2. Sign in with GitHub
3. Click **New +** → **Web Service**
4. Connect your forked `subconverter` repository
5. Configure:
   - **Name**: `digital-freedom-backend` (or any name)
   - **Environment**: `Docker`
   - **Region**: Choose closest to your users
   - **Branch**: `master`
   - **Plan**: **Free**
6. Click **Create Web Service**
7. Wait for deployment (5-10 minutes)
8. **Copy your Render URL**: `https://digital-freedom-backend.onrender.com`

> [!IMPORTANT]
> Save this URL! You'll need it in the next steps.

---

## Part 2: Deploy Worker (Cloudflare Workers)

### Step 1: Install Wrangler CLI

Open terminal and run:

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window. Authorize Wrangler.

### Step 3: Update Worker Configuration

1. Open `worker/wrangler.toml`
2. Replace `YOUR_RENDER_APP.onrender.com` with your actual Render URL:
   ```toml
   [vars]
   BACKEND_URL = "https://digital-freedom-backend.onrender.com"
   ```

### Step 4: Install Dependencies

```bash
cd worker
npm install
```

### Step 5: Deploy Worker

```bash
npm run deploy
```

You'll get a URL like: `https://subscription-converter-worker.YOUR_SUBDOMAIN.workers.dev`

### Step 6: Configure Custom Domain

1. Go to Cloudflare Dashboard → Workers & Pages
2. Click your worker → **Settings** → **Triggers**
3. Click **Add Custom Domain**
4. Enter: `api.digital-freedom.site`
5. Click **Add Custom Domain**

---

## Part 3: Deploy Frontend (Cloudflare Pages)

### Step 1: Update Frontend Configuration

1. Open `frontend/src/views/Subconverter.vue` (or similar config file)
2. Find the API endpoint configuration
3. Update to: `https://api.digital-freedom.site`

Alternatively, create `.env` file in `frontend/`:

```env
VUE_APP_API_URL=https://api.digital-freedom.site
VUE_APP_SITE_NAME=Digital Freedom
```

### Step 2: Push to GitHub

1. Create a new GitHub repository: `subscription-converter`
2. Push your code:

```bash
cd subscription-converter
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/subscription-converter.git
git push -u origin main
```

### Step 3: Deploy on Cloudflare Pages

1. Go to Cloudflare Dashboard → **Workers & Pages**
2. Click **Create Application** → **Pages** → **Connect to Git**
3. Select your `subscription-converter` repository
4. Configure build:
   - **Framework preset**: Vue
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
5. Click **Save and Deploy**
6. Wait for deployment (3-5 minutes)

### Step 4: Configure Custom Domain

1. In Cloudflare Pages, go to your project
2. Click **Custom domains** → **Set up a custom domain**
3. Enter: `sub.digital-freedom.site`
4. Click **Continue** → **Activate domain**

---

## Part 4: DNS Configuration

Go to Cloudflare Dashboard → Your domain → **DNS**

### Add/Verify Records:

1. **Frontend (sub.digital-freedom.site)**:
   - Should be auto-created by Cloudflare Pages
   - Type: `CNAME`
   - Name: `sub`
   - Target: `[your-pages-project].pages.dev`
   - Proxy: ✅ Enabled (orange cloud)

2. **API (api.digital-freedom.site)**:
   - Should be auto-created by Workers
   - Type: `CNAME`
   - Name: `api`
   - Target: `[your-worker].workers.dev`
   - Proxy: ✅ Enabled (orange cloud)

---

## Part 5: Testing

### Test Backend (Render)

```bash
curl https://digital-freedom-backend.onrender.com/version
```

Should return version info.

### Test Worker (API)

```bash
curl https://api.digital-freedom.site/health
```

Should return:
```json
{
  "status": "ok",
  "service": "Digital Freedom Subscription Converter",
  "version": "1.0.0"
}
```

### Test Frontend

Open browser: `https://sub.digital-freedom.site`

You should see the subscription converter interface.

### Test Full Conversion

1. Go to `https://sub.digital-freedom.site`
2. Paste a test subscription URL
3. Select target format (e.g., Clash)
4. Click Generate
5. You should get a converted subscription link

---

## Troubleshooting

### Backend shows "Service Unavailable"

- Render free tier sleeps after 15 minutes of inactivity
- First request will take 30-60 seconds to wake up
- Worker will cache subsequent requests

### Frontend not connecting to API

- Check `frontend/.env` or config file has correct API URL
- Verify CORS is enabled in Worker (it is by default)
- Check browser console for errors

### Custom domain not working

- DNS propagation can take up to 24 hours (usually 5-10 minutes)
- Verify DNS records in Cloudflare
- Make sure Proxy is enabled (orange cloud)

---

## Next Steps

- Customize branding in frontend
- Add custom rules/configurations
- Monitor usage in Cloudflare dashboard
- Set up analytics (optional)

---

## Support

If you encounter issues, check:
- Render.com logs
- Cloudflare Workers logs
- Browser console errors
