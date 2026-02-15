# ✅ আপনার কাজের তালিকা (Step-by-Step)

এই গাইড অনুসরণ করে আপনি সম্পূর্ণ সিস্টেম deploy করতে পারবেন।

---

## 📋 প্রয়োজনীয় জিনিস

- ✅ Cloudflare account (ফ্রি)
- ✅ Render.com account (ফ্রি)
- ✅ GitHub account (আপনার আছে)
- ✅ Domain: digital-freedom.site (Cloudflare এ add করা আছে)
- ⚠️ Node.js installed (আপনার PC তে থাকা লাগবে)

---

## Part 1️⃣: Backend Deploy করুন (Render.com)

### ধাপ ১: Subconverter Fork করুন

1. এই লিংকে যান: https://github.com/tindy2013/subconverter
2. উপরে ডানদিকে **Fork** বাটনে ক্লিক করুন
3. আপনার GitHub account এ fork করুন

### ধাপ ২: Render.com এ Deploy করুন

1. যান: https://render.com
2. GitHub দিয়ে Sign in করুন
3. **New +** ক্লিক করুন → **Web Service** সিলেক্ট করুন
4. আপনার fork করা `subconverter` repository connect করুন
5. এই settings দিন:
   - **Name**: `digital-freedom-backend` (যেকোনো নাম দিতে পারেন)
   - **Environment**: `Docker` সিলেক্ট করুন
   - **Region**: আপনার কাছের region সিলেক্ট করুন
   - **Branch**: `master`
   - **Plan**: **Free** সিলেক্ট করুন
6. **Create Web Service** ক্লিক করুন
7. Deploy হতে 5-10 মিনিট অপেক্ষা করুন
8. **গুরুত্বপূর্ণ**: Deploy শেষ হলে আপনার Render URL কপি করুন:
   ```
   https://digital-freedom-backend.onrender.com
   ```
   (আপনার নাম অনুযায়ী URL ভিন্ন হবে)

✅ **Backend সম্পন্ন!**

---

## Part 2️⃣: Worker Deploy করুন (Cloudflare Workers)

### ধাপ ১: Wrangler CLI Install করুন

PowerShell/Terminal খুলুন এবং এই command চালান:

```powershell
npm install -g wrangler
```

### ধাপ ২: Cloudflare এ Login করুন

```powershell
wrangler login
```

Browser খুলবে, Cloudflare authorize করুন।

### ধাপ ৩: Worker Configuration Update করুন

1. এই ফাইল খুলুন: `subscription-converter\worker\wrangler.toml`
2. Line 14 এ আপনার Render URL দিন:
   ```toml
   BACKEND_URL = "https://digital-freedom-backend.onrender.com"
   ```
   (আপনার actual Render URL দিন)

### ধাপ ৪: Dependencies Install করুন

```powershell
cd c:\Users\DELL\Downloads\Antigravity\subscription-converter\worker
npm install
```

### ধাপ ৫: Worker Deploy করুন

```powershell
npm run deploy
```

আপনি একটি URL পাবেন যেমন:
```
https://subscription-converter-worker.YOUR_SUBDOMAIN.workers.dev
```

### ধাপ ৬: Custom Domain Configure করুন

1. Cloudflare Dashboard এ যান → **Workers & Pages**
2. আপনার worker এ ক্লিক করুন → **Settings** → **Triggers**
3. **Add Custom Domain** ক্লিক করুন
4. এই domain লিখুন: `api.digital-freedom.site`
5. **Add Custom Domain** ক্লিক করুন

✅ **Worker সম্পন্ন!**

---

## Part 3️⃣: Frontend Deploy করুন (Cloudflare Pages)

### ধাপ ১: GitHub Repository তৈরি করুন

1. GitHub এ যান: https://github.com/new
2. Repository name দিন: `subscription-converter`
3. **Public** সিলেক্ট করুন
4. **Create repository** ক্লিক করুন

### ধাপ ২: Code Push করুন

PowerShell/Terminal এ:

```powershell
cd c:\Users\DELL\Downloads\Antigravity\subscription-converter
git init
git add .
git commit -m "Initial commit - Digital Freedom Converter"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/subscription-converter.git
git push -u origin main
```

(YOUR_USERNAME আপনার GitHub username দিয়ে replace করুন)

### ধাপ ৩: Cloudflare Pages এ Deploy করুন

1. Cloudflare Dashboard → **Workers & Pages**
2. **Create Application** → **Pages** → **Connect to Git**
3. আপনার `subscription-converter` repository সিলেক্ট করুন
4. Build settings:
   - **Framework preset**: Vue
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
5. **Save and Deploy** ক্লিক করুন
6. Deploy হতে 3-5 মিনিট অপেক্ষা করুন

### ধাপ ৪: Custom Domain Add করুন

1. Cloudflare Pages এ আপনার project এ যান
2. **Custom domains** → **Set up a custom domain**
3. এই domain লিখুন: `sub.digital-freedom.site`
4. **Continue** → **Activate domain** ক্লিক করুন

✅ **Frontend সম্পন্ন!**

---

## Part 4️⃣: Test করুন

### Test 1: Backend Check

Browser এ যান:
```
https://digital-freedom-backend.onrender.com/version
```

Version info দেখাবে (প্রথমবার 30-60 সেকেন্ড লাগতে পারে)

### Test 2: Worker/API Check

Browser এ যান:
```
https://api.digital-freedom.site/health
```

এরকম দেখাবে:
```json
{
  "status": "ok",
  "service": "Digital Freedom Subscription Converter",
  "version": "1.0.0"
}
```

### Test 3: Frontend Check

Browser এ যান:
```
https://sub.digital-freedom.site
```

Subscription converter interface দেখাবে! 🎉

---

## 🎯 সম্পন্ন!

এখন আপনার নিজের subscription converter চালু আছে!

### 📱 ব্যবহার করুন:

1. `https://sub.digital-freedom.site` এ যান
2. আপনার subscription URL paste করুন
3. Target format সিলেক্ট করুন (Clash, Surge, etc.)
4. Generate ক্লিক করুন
5. Converted link কপি করুন
6. আপনার VPN client এ ব্যবহার করুন

---

## ⚠️ সমস্যা হলে:

### "Service Unavailable" দেখাচ্ছে
- Render backend ঘুমিয়ে আছে (free tier)
- 30-60 সেকেন্ড অপেক্ষা করে আবার try করুন

### Frontend API connect করতে পারছে না
- `frontend/.env` ফাইল check করুন
- Browser console এ error check করুন

### Custom domain কাজ করছে না
- DNS propagation এ 5-10 মিনিট লাগতে পারে
- Cloudflare DNS records check করুন

---

## 📚 আরও তথ্যের জন্য:

- বিস্তারিত deployment guide: `docs/DEPLOYMENT.md`
- Configuration guide: `docs/CONFIGURATION.md`
- User guide: `docs/USER_GUIDE.md`

---

**সফল হোক! 🚀**
