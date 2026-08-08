# SaringKu — Cloudflare Pages deployment

## 1. Push this folder to GitHub
Replace the existing repo contents with this Cloudflare-ready version (or commit it on a migration branch first).

## 2. Create a Cloudflare Pages project
Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.

Select the GitHub repository `myee0021-beep/5120_tm01`.

Recommended build settings for this static project:
- Framework preset: None
- Build command: leave empty
- Build output directory: `.`
- Root directory: repository root

## 3. Add secrets / environment variables
In Cloudflare Pages → your project → Settings → Variables and Secrets, add:

- `DATABASE_URL` = your existing Neon PostgreSQL connection string
- `MINIMAX_API_KEY` = your MiniMax API key
- Optional: `MINIMAX_MODEL` = `MiniMax-Text-01`

Use Secrets for API keys where Cloudflare offers the choice. Do not put real keys in `index.html`, GitHub, or `wrangler.jsonc`.

## 4. Database
No database migration is required. This project continues to use the existing Neon PostgreSQL database and the same tables/schema.

## 5. Cloudflare endpoints
- `GET /api/get-risk-data`
- `GET /api/get-schemes`
- `POST /api/save-assessment`
- `GET /api/get-debug-schema` (diagnostic only; remove/disable before a public production launch if not needed)
- `POST /api/chat`

## 6. First test after deployment
1. Open the homepage.
2. Check browser console: live risk and scheme data should load without Netlify errors.
3. Complete Check My Risk and confirm the assessment saves.
4. Open the AI assistant and send a question.
5. If an endpoint fails, check Cloudflare Function logs and confirm the environment variables are set for Production.

## Security note
A MiniMax key was previously placed in a browser-side demo file. Rotate/revoke that key before public deployment, then store the replacement only as `MINIMAX_API_KEY` in Cloudflare.
