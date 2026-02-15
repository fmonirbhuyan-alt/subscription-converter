# User Guide - Digital Freedom Subscription Converter

## What is this?

Digital Freedom Subscription Converter allows you to convert VPN/Proxy subscription links between different formats, making them compatible with various client applications.

---

## Supported Formats

### Input Formats (Source)
- Shadowsocks (SS)
- ShadowsocksR (SSR)
- V2Ray/VMess
- Trojan
- HTTP/HTTPS Proxy
- SOCKS5 Proxy
- Standard subscription URLs

### Output Formats (Target)
- **Clash** - For Clash, Clash for Android, ClashX
- **Surge** - For Surge iOS/Mac
- **Quantumult** - For Quantumult iOS
- **Quantumult X** - For Quantumult X iOS
- **Shadowrocket** - For Shadowrocket iOS
- **Surfboard** - For Surfboard Android
- **Loon** - For Loon iOS
- **V2Ray** - For V2RayN, V2RayNG
- **SS/SSR** - Standard formats

---

## How to Use

### Step 1: Get Your Subscription URL

From your VPN provider, copy your subscription URL. It usually looks like:
```
https://provider.com/api/subscribe/YOUR_KEY
```

### Step 2: Open Digital Freedom Converter

Go to: **https://sub.digital-freedom.site**

### Step 3: Paste Your Subscription URL

1. Find the "Subscription URL" input field
2. Paste your subscription URL
3. If you have multiple subscriptions, separate them with `|`:
   ```
   https://provider1.com/sub/key1|https://provider2.com/sub/key2
   ```

### Step 4: Select Target Format

Choose the format you need based on your client app:

| Client App | Target Format |
|------------|---------------|
| Clash for Android | Clash |
| Clash for Windows | Clash |
| ClashX (Mac) | Clash |
| Surge (iOS/Mac) | Surge |
| Shadowrocket (iOS) | Shadowrocket |
| Quantumult X (iOS) | Quantumult X |
| V2RayN (Windows) | V2Ray |
| V2RayNG (Android) | V2Ray |

### Step 5: Generate Converted Link

1. Click **Generate** or **Convert** button
2. Wait a few seconds
3. Copy the generated link

### Step 6: Use in Your Client

1. Open your VPN client app
2. Add subscription using the converted link
3. Update/Refresh subscription
4. Connect to a server

---

## Advanced Features

### Merging Multiple Subscriptions

To combine multiple subscriptions into one:

1. Separate URLs with `|` symbol:
   ```
   https://sub1.com/key|https://sub2.com/key
   ```
2. All servers from both subscriptions will be merged

### Custom Rules

You can select different rule sets:
- **Default**: Balanced rules for general use
- **ACL4SSR**: Popular Chinese rule set
- **Custom**: Upload your own rules

### Backend Configuration

Choose backend server:
- **Default**: `api.digital-freedom.site` (recommended)
- **Custom**: Use your own backend URL

---

## Platform-Specific Guides

### Android

**Clash for Android**:
1. Open Clash
2. Tap **Profiles**
3. Tap **+** → **URL**
4. Paste converted link
5. Tap **Download**

**V2RayNG**:
1. Open V2RayNG
2. Tap **+** → **Import from URL**
3. Paste converted link

### iOS

**Shadowrocket**:
1. Open Shadowrocket
2. Tap **+** (top right)
3. Select **Subscribe**
4. Paste converted link
5. Tap **Download**

**Quantumult X**:
1. Open Quantumult X
2. Settings → Server
3. Long press on blank area
4. Paste converted link

### Windows

**Clash for Windows**:
1. Open Clash
2. Profiles tab
3. Paste URL in input field
4. Click **Download**

**V2RayN**:
1. Open V2RayN
2. Subscription → Subscribe Settings
3. Add subscription URL
4. Update subscription

### Mac

**ClashX**:
1. Click ClashX icon in menu bar
2. Config → Remote Config → Manage
3. Add URL
4. Update

---

## Troubleshooting

### "Backend service unavailable"

**Cause**: Backend is waking up from sleep (Render.com free tier)

**Solution**: Wait 30-60 seconds and try again

### "Invalid subscription URL"

**Cause**: URL format is incorrect or subscription is expired

**Solution**: 
- Check URL is complete and correct
- Contact your VPN provider for a new subscription

### "Conversion failed"

**Cause**: Subscription format not supported or empty

**Solution**:
- Verify your subscription works in original client
- Try a different target format
- Check if subscription has expired

### Converted link not working in client

**Cause**: Wrong target format or client configuration

**Solution**:
- Make sure you selected correct target format
- Try regenerating the link
- Check client app is up to date

---

## Privacy & Security

### Is my subscription URL safe?

- Your original subscription URL is **not stored** on our servers
- Conversion happens in real-time
- Converted links are cached for 1 hour for performance
- We recommend using your own deployment for maximum privacy

### Can others see my subscription?

- The converted link contains your original subscription URL (encoded)
- Anyone with the converted link can access your subscription
- **Do not share** converted links publicly
- Treat converted links as sensitive as your original subscription

---

## FAQ

**Q: Is this service free?**  
A: Yes, completely free with no limitations.

**Q: How often should I update my subscription?**  
A: Most clients auto-update daily. Manual update when servers change.

**Q: Can I use this for commercial purposes?**  
A: Personal use recommended. For commercial use, deploy your own instance.

**Q: What happens if the service goes down?**  
A: Your existing converted links will stop working. Deploy your own instance for reliability.

**Q: How do I deploy my own instance?**  
A: See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## Support

For issues or questions:
- Check [Troubleshooting](#troubleshooting) section
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for technical details
- Open an issue on GitHub (if self-hosting)
