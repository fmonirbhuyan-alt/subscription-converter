# Quick Start Guide

## ⚡ 5-Minute Deployment

### Prerequisites
- ✅ Cloudflare account
- ✅ Render.com account  
- ✅ GitHub account
- ✅ Domain on Cloudflare: `digital-freedom.site`

---

## Step 1: Backend (2 minutes)

1. Fork: https://github.com/tindy2013/subconverter
2. Go to: https://render.com
3. New → Web Service → Connect your fork
4. Settings:
   - Name: `digital-freedom-backend`
   - Environment: Docker
   - Plan: Free
5. Deploy
6. **Copy URL**: `https://digital-freedom-backend.onrender.com`

---

## Step 2: Worker (1 minute)

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Update backend URL in worker/wrangler.toml
# Replace YOUR_RENDER_APP with your actual URL

# Deploy
cd worker
npm install
npm run deploy
```

Add custom domain in Cloudflare Dashboard:
- Workers → Your Worker → Triggers → Add Custom Domain
- Domain: `api.digital-freedom.site`

---

## Step 3: Frontend (2 minutes)

1. Update `frontend/.env`:
   ```env
   VUE_APP_API_URL=https://api.digital-freedom.site
   ```

2. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/subscription-converter.git
   git push -u origin main
   ```

3. Cloudflare Pages:
   - Workers & Pages → Create → Connect to Git
   - Select repository
   - Build command: `cd frontend && npm install && npm run build`
   - Output: `frontend/dist`
   - Deploy

4. Add custom domain: `sub.digital-freedom.site`

---

## Step 4: Test

Open: **https://sub.digital-freedom.site**

Done! 🎉

---

## Need Help?

See full guide: [DEPLOYMENT.md](DEPLOYMENT.md)
