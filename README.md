# CrushBot 💌

An AI-powered pickup line & compliment generator built for the **Synapse AIML Club Web Designing Competition 2026**.

**Live demo:** https://web-dev-eight-mauve.vercel.app/

## What it does

Pick a vibe, tap **Generate a line**, and get a fresh, AI-written pickup line or compliment every time — never a hardcoded, repeated line. The card flips like a holographic reveal, with a particle burst and a one-tap copy button so you can paste it straight into WhatsApp, Instagram, or wherever.

## Vibes

- 🥰 **Cute** — wholesome, sweet, genuine
- 🔥 **Savage** — confident, cheeky, roast-flavored
- 🧀 **Cheesy** — deliberately groan-worthy
- 💀 **GenZ Slang** — rizz, no cap, lowkey, delulu
- 🙏 **Apology** — sincere, warm sorry messages

Each vibe remembers the lines it's already given you in the current session and tells the AI not to repeat them, so every click stays fresh.

## Tech stack

- **Frontend:** React + Vite, custom CSS (glassmorphism, 3D card-flip via CSS transforms, particle animation)
- **Icons:** lucide-react
- **AI:** Google Gemini API (`gemini-3.6-flash`), called through a serverless backend
- **Backend:** Vercel serverless function (`/api/generate`) — keeps the API key server-side, never exposed to the browser
- **Hosting:** Vercel

## Project structure

```
crushbot-project/
├── api/
│   └── generate.js      # Serverless function — calls Gemini, keeps API key secret
├── src/
│   ├── CrushBot.jsx      # Main app component (UI, vibe logic, animations)
│   └── main.jsx           # React entry point
├── index.html
├── package.json
├── vite.config.js
└── .env.example            # Shows required env var name (no real key committed)
```

## Running locally

```bash
npm install
npm run dev
```

Create a `.env` file (never commit this) with:

```
GEMINI_API_KEY=your_key_here
```

## Deployment

Deployed on Vercel, connected directly to this GitHub repo. `GEMINI_API_KEY` is set as an environment variable in the Vercel project settings (Settings → Environment Variables) — the key never lives in the codebase.


---

Design. Create. Innovate. — Web Designing Competition 2026
