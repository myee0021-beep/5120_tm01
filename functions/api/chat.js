function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function cleanString(value, max = 1200) {
  return String(value ?? '').trim().slice(0, max);
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') return json({ error: 'Method not allowed. Use POST.' }, 405, { Allow: 'POST' });
  const apiKey = context.env.MINIMAX_API_KEY;
  if (!apiKey) {
    return json({ error: 'MINIMAX_API_KEY is not configured in Cloudflare.' }, 500);
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  const message = cleanString(body.message, 800);
  const language = body.language === 'bm' ? 'bm' : 'en';
  const page = cleanString(body.page, 60);
  const profile = body.profile && typeof body.profile === 'object' ? body.profile : null;
  const risk = body.risk && typeof body.risk === 'object' ? body.risk : null;
  const eligibility = Array.isArray(body.eligibility) ? body.eligibility.slice(0, 8) : [];
  const history = Array.isArray(body.history)
    ? body.history.slice(-8).map(item => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: cleanString(item.content, 1000),
      })).filter(item => item.content)
    : [];

  if (!message) return json({ error: 'Message is required.' }, 400);

  const contextBlock = JSON.stringify({ page, profile, risk, eligibility }, null, 2).slice(0, 6000);
  const systemPrompt = `You are SaringKu AI Assistant, a cautious health-information and Malaysian health-service navigation assistant embedded in the SaringKu screening website.

Rules:
- Reply in ${language === 'bm' ? 'Bahasa Melayu' : 'English'} unless the user clearly asks for another language.
- Use the supplied SaringKu context when relevant. Do not invent assessment results, eligibility, clinic facts, government programme rules, prices, or URLs.
- Treat SaringKu risk results as informational screening guidance, not a diagnosis or prediction of an individual's disease.
- Do not diagnose, prescribe medicines, recommend dosages, or tell a user to stop/change prescribed treatment.
- For severe, rapidly worsening, or emergency symptoms, advise seeking urgent in-person medical care or local emergency services.
- Keep answers concise and practical. Explain uncertainty where needed.
- You may explain how to use Check My Risk, Find a Clinic, My Plan, SOCSO, PeKa B40, Klinik Kesihatan and quit-smoking support only to the extent supported by the provided context/site information.

Current SaringKu context:
${contextBlock}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ];

  try {
    const upstream = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: context.env.MINIMAX_MODEL || 'MiniMax-Text-01',
        messages,
        temperature: 0.3,
        max_tokens: 700,
      }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error('[SaringKu] MiniMax error:', upstream.status, data);
      return json({ error: 'AI service is temporarily unavailable.' }, 502);
    }

    const reply = data?.choices?.[0]?.message?.content || data?.reply || data?.output_text;
    if (!reply) {
      console.error('[SaringKu] Unexpected MiniMax response:', data);
      return json({ error: 'AI service returned an empty response.' }, 502);
    }

    return json({ reply: String(reply) });
  } catch (err) {
    console.error('[SaringKu] AI request failed:', err);
    return json({ error: 'Unable to reach the AI service.' }, 502);
  }
}

