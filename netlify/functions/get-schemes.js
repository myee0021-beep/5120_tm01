// Reads government screening programme data from Screening_Program table in Neon (Postgres).
const { neon } = require('@neondatabase/serverless');

exports.handler = async function () {
  try {
    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'DATABASE_URL environment variable is not set in Netlify.' }),
      };
    }
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT program_code, name_en, name_bm, provider, cost_rm, covers, how_to_access, url, copy_en, copy_bm
      FROM screening_program
    `;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
      body: JSON.stringify(rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
