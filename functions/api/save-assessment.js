import { neon } from '@neondatabase/serverless';

const allowedSexes = new Set(['male', 'female']);
const allowedSmoking = new Set(['never', 'sometimes', 'daily']);
const allowedLastCheck = new Set(['lt1', '1to5', 'gt5']);

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

function ageGroupFor(age) {
  if (age <= 14) return '0-14';
  if (age <= 40) return '15-40';
  if (age <= 59) return '41-59';
  return '60+';
}

function estimatedCheckupYear(lastCheck) {
  const year = new Date().getUTCFullYear();
  if (lastCheck === 'lt1') return year;
  if (lastCheck === '1to5') return year - 3;
  return year - 6;
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') return json({ error: 'Method not allowed. Use POST.' }, 405, { Allow: 'POST' });
  const databaseUrl = context.env.DATABASE_URL;
  if (!databaseUrl) {
    return json({ error: 'DATABASE_URL environment variable is not set in Cloudflare.' }, 500);
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  const age = Number(body.age);
  const sex = String(body.sex || '').toLowerCase();
  const state = String(body.state || '').trim();
  const smoking = String(body.smoking || '').toLowerCase();
  const lastCheck = String(body.lastCheck || '');

  if (!Number.isInteger(age) || age < 0 || age > 120) {
    return json({ error: 'Age must be a whole number between 0 and 120.' }, 400);
  }
  if (!allowedSexes.has(sex)) {
    return json({ error: 'Sex must be male or female.' }, 400);
  }
  if (!state || state.length > 50) {
    return json({ error: 'State is required and must be 50 characters or fewer.' }, 400);
  }
  if (!allowedSmoking.has(smoking)) {
    return json({ error: 'Smoking must be never, sometimes or daily.' }, 400);
  }
  if (!allowedLastCheck.has(lastCheck)) {
    return json({ error: 'Last check-up band is invalid.' }, 400);
  }

  const ageGroup = ageGroupFor(age);
  const lastCheckupYear = estimatedCheckupYear(lastCheck);

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      WITH selected_mortality AS (
        SELECT mortality_id, cause, share_pct
        FROM mortality
        WHERE age_group = ${ageGroup}
          AND LOWER(state) = 'malaysia'
          AND (sex IS NULL OR sex = '')
        ORDER BY share_pct DESC NULLS LAST
        LIMIT 1
      ),
      new_user AS (
        INSERT INTO user_profile (age, sex, state, created_at)
        SELECT ${age}, ${sex}, ${state}, CURRENT_TIMESTAMP
        FROM selected_mortality
        RETURNING user_id
      ),
      new_assessment AS (
        INSERT INTO health_assessment
          (user_id, smoking, last_checkup_year, assessment_date)
        SELECT user_id, ${smoking}, ${lastCheckupYear}, CURRENT_TIMESTAMP
        FROM new_user
        RETURNING assessment_id, user_id
      ),
      new_risk AS (
        INSERT INTO risk_result
          (assessment_id, mortality_id, leading_risk, risk_percentage, explanation, generated_date)
        SELECT
          a.assessment_id,
          m.mortality_id,
          m.cause,
          m.share_pct,
          CONCAT(
            'Among Malaysians aged ', CAST(${ageGroup} AS text), ', ', LOWER(m.cause),
            ' accounts for ', m.share_pct,
            '% of certified deaths and is the leading cause in this age group.'
          ),
          CURRENT_TIMESTAMP
        FROM new_assessment a
        CROSS JOIN selected_mortality m
        RETURNING risk_id, assessment_id, leading_risk, risk_percentage
      )
      SELECT
        u.user_id,
        a.assessment_id,
        r.risk_id,
        r.leading_risk,
        r.risk_percentage
      FROM new_user u
      JOIN new_assessment a ON a.user_id = u.user_id
      JOIN new_risk r ON r.assessment_id = a.assessment_id
    `;

    if (!rows.length) {
      return json({ error: `No mortality data found for age group ${ageGroup}.` }, 422);
    }

    return json({ saved: true, ...rows[0] }, 201);
  } catch (err) {
    console.error('[SaringKu] Failed to save assessment:', err);
    return json({ error: 'Unable to save assessment.' }, 500);
  }
}

