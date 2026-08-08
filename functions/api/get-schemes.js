import { neon } from '@neondatabase/serverless';

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
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
      SELECT program_code, name_en, name_bm, provider, cost_rm, covers, how_to_access, url, copy_en, copy_bm
      FROM screening_program
    `;

    return json(rows, 200, { 'Cache-Control': 'public, max-age=300' });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

