import { neon } from '@neondatabase/serverless';

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}

export async function onRequest(context) {
  if (context.request.method !== 'GET') return json({ error: 'Method not allowed. Use GET.' }, 405, { Allow: 'GET' });
  try {
    const databaseUrl = context.env.DATABASE_URL;
    if (!databaseUrl) {
      return json({ error: 'DATABASE_URL environment variable is not set in Cloudflare.' }, 500);
    }

    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT year, age_group, sex, state, cause, deaths, share_pct
      FROM mortality
      ORDER BY age_group, share_pct DESC
    `;

    return json(rows, 200, { 'Cache-Control': 'public, max-age=300' });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

