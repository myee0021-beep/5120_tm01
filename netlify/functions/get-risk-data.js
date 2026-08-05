// Reads DOSM mortality data from the Mortality table in Neon (Postgres).
// The DATABASE_URL environment variable must be set in Netlify's
// Site settings -> Environment variables -> DATABASE_URL (never commit it to git).
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
      SELECT year, age_group, sex, state, cause, deaths, share_pct
      FROM "Mortality"
      ORDER BY age_group, share_pct DESC
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
