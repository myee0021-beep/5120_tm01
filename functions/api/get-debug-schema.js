import { neon } from '@neondatabase/serverless';

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
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
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `;
    return json(rows);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

