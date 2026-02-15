# Digital Freedom - Subscription Converter

A free, fast, and reliable VPN/Proxy subscription converter built with:
- **Frontend**: Vue.js (sub-web) on Cloudflare Pages
- **Backend**: Subconverter on Render.com
- **Proxy/Cache**: Cloudflare Workers
- **Domain**: digital-freedom.site

## 🌟 Features

- ✅ Convert between multiple subscription formats (SS, SSR, V2Ray, Trojan, etc.)
- ✅ Support for Clash, Surge, Quantumult X, Shadowrocket, and more
- ✅ Merge multiple subscriptions
- ✅ Custom rules and configurations
- ✅ Fast CDN delivery worldwide
- ✅ Completely free with no limitations
- ✅ Cross-platform (Android, iOS, Windows, Mac, Linux)

## 📁 Project Structure

```
subscription-converter/
├── frontend/          # sub-web (Vue.js frontend)
├── worker/           # Cloudflare Worker (proxy + cache)
├── docs/             # Documentation
└── README.md
```

## 🚀 Deployment

See the detailed deployment guide in `docs/DEPLOYMENT.md`

### Quick Overview:

1. **Frontend** → Deploy to Cloudflare Pages
2. **Backend** → Deploy to Render.com using Docker
3. **Worker** → Deploy to Cloudflare Workers
4. **Domain** → Configure DNS on Cloudflare

## 🔗 URLs

- Frontend: `https://sub.digital-freedom.site`
- API: `https://api.digital-freedom.site`

## 📖 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Configuration Guide](docs/CONFIGURATION.md)
- [User Guide](docs/USER_GUIDE.md)

## 🙏 Credits

- [sub-web](https://github.com/CareyWang/sub-web) - Frontend UI
- [subconverter](https://github.com/tindy2013/subconverter) - Backend converter

## 📄 License

MIT License
