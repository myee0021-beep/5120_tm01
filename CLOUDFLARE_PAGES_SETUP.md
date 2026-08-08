# SaringKu — Cloudflare Pages final setup

This repository is structured specifically for Cloudflare Pages + Pages Functions.

## Cloudflare Build configuration
Keep:
- Build command: None
- Root directory: /

Change **Deploy command** to exactly:

```bash
npx wrangler pages deploy public --project-name=5120-tm01-1
```

Do NOT use `npx wrangler deploy` for this Pages project.

## Variables and secrets
Cloudflare Dashboard → your Pages project → Settings → Variables and Secrets:

- `DATABASE_URL` = existing Neon PostgreSQL connection string
- `MINIMAX_API_KEY` = MiniMax API key
- Optional: `MINIMAX_MODEL` = `MiniMax-Text-01`

## Structure
- `public/index.html` — frontend
- `functions/api/*.js` — Cloudflare Pages Functions

Endpoints:
- `GET /api/get-risk-data`
- `GET /api/get-schemes`
- `GET /api/get-debug-schema`
- `POST /api/save-assessment`
- `POST /api/chat`
