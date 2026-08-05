// Diagnostic-only endpoint: lists every real table + column in the connected database.
// Visit /.netlify/functions/get-debug-schema in a browser to see what's actually there,
// useful for checking whether table/column names match what the frontend expects.
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
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows, null, 2),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
