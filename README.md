# خليج مونيتور — Gulf Crisis Monitor

Live Arabic dashboard tracking the 2026 Iran conflict. Built for the Kuwaiti public.

## Features
- 📰 Live news feed with source links (Claude API + web search)
- 🗺️ Interactive map with events, military bases, carrier positions, timeline
- 🏛️ Official government announcements with source attribution
- 🔍 Rumor fact-checking section
- 🚨 Emergency info (shelters, siren instructions, phone numbers)
- 📊 Airspace & oil/shipping status tracker
- 📱 WhatsApp/Telegram/X share buttons
- ⏱️ Live conflict timer

---

## Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub

```bash
# In this project folder:
git init
git add .
git commit -m "Gulf Monitor v3"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/gulf-monitor.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `gulf-monitor` repository
4. Vercel auto-detects Vite — just click **"Deploy"**
5. Your site is live at `gulf-monitor-XXXX.vercel.app`

### Step 3: Add your API key

1. In Vercel dashboard → your project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key (starts with `sk-ant-`)
3. Click **Save**
4. Go to **Deployments** → click **"Redeploy"** on the latest deployment

### Step 4: Test it

- Visit your `.vercel.app` URL
- Click the "تحديث مباشر" (Live Update) button
- It should fetch fresh news via Claude API

---

## Custom Domain (optional)

1. Buy a domain (e.g. `khalijmonitor.com` from Namecheap/GoDaddy)
2. In Vercel → Settings → Domains → Add your domain
3. Update your DNS records as Vercel instructs
4. SSL is automatic

---

## Project Structure

```
gulf-monitor/
├── api/
│   └── news.js          # Serverless function (proxies Claude API)
├── src/
│   ├── App.jsx          # Main Gulf Monitor component
│   └── main.jsx         # React entry point
├── public/              # Static assets
├── index.html           # HTML entry with Arabic meta tags
├── package.json
├── vite.config.js
├── vercel.json          # Vercel routing config
└── .gitignore
```

## How the Live News Works

```
User clicks "تحديث مباشر"
        ↓
Browser → POST /api/news
        ↓
Vercel serverless function (api/news.js)
        ↓
Claude API + Web Search → fetches latest news
        ↓
Parses Arabic headlines + source URLs
        ↓
Returns JSON to browser
        ↓
Displayed as "خبر مباشر" cards with source links
```

Your API key never leaves the server. Users only see the results.

---

## Cost Estimate

- **Vercel hosting:** Free tier (100GB bandwidth/month — more than enough)
- **Domain:** ~$10/year (optional)
- **Claude API:** ~$0.003 per news refresh (Sonnet with web search)
  - If 1000 users refresh 5x/day = 5000 calls = ~$15/day
  - Consider adding caching (Redis/KV) to reduce costs

## Adding Caching (recommended for production)

To avoid hitting the API on every user click, add Vercel KV:

```bash
# In Vercel dashboard → Storage → Create KV Database
# Then update api/news.js to cache results for 5 minutes
```

I can help you implement this if needed.

---

## Legal Disclaimer

All news content is sourced from and attributed to official news agencies and government sources. Each item includes a direct link to the original source. This platform aggregates and does not generate original news content.
