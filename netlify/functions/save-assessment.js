// Saves one completed SaringKu assessment to Neon (Postgres).
// The insert is a single SQL statement so the user, assessment and risk rows
// are created together or not at all.
const { neon } = require('@neondatabase/serverless');

const allowedSexes = new Set(['male', 'female']);
const allowedSmoking = new Set(['never', 'sometimes', 'daily']);
const allowedLastCheck = new Set(['lt1', '1to5', 'gt5']);

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
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

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed. Use POST.' });
  }

  if (!process.env.DATABASE_URL) {
    return json(500, { error: 'DATABASE_URL environment variable is not set in Netlify.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Request body must be valid JSON.' });
  }

  const age = Number(body.age);
  const sex = String(body.sex || '').toLowerCase();
  const state = String(body.state || '').trim();
  const smoking = String(body.smoking || '').toLowerCase();
  const lastCheck = String(body.lastCheck || '');

  if (!Number.isInteger(age) || age < 0 || age > 120) {
    return json(400, { error: 'Age must be a whole number between 0 and 120.' });
  }
  if (!allowedSexes.has(sex)) {
    return json(400, { error: 'Sex must be male or female.' });
  }
  if (!state || state.length > 50) {
    return json(400, { error: 'State is required and must be 50 characters or fewer.' });
  }
  if (!allowedSmoking.has(smoking)) {
    return json(400, { error: 'Smoking must be never, sometimes or daily.' });
  }
  if (!allowedLastCheck.has(lastCheck)) {
    return json(400, { error: 'Last check-up band is invalid.' });
  }

  const ageGroup = ageGroupFor(age);
  const lastCheckupYear = estimatedCheckupYear(lastCheck);

  try {
    const sql = neon(process.env.DATABASE_URL);
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
      return json(422, { error: `No mortality data found for age group ${ageGroup}.` });
    }

    return json(201, { saved: true, ...rows[0] });
  } catch (err) {
    console.error('[SaringKu] Failed to save assessment:', err);
    return json(500, { error: 'Unable to save assessment.' });
  }
};
