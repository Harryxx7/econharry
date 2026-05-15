const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const SYSTEM_PROMPT = `你是一个辅助备考复旦大学431金融专硕的学习助手。

你的工作方式：
- 如果用户的问题附带了"【知识库内容】"，你必须严格基于这些内容来回答，不得引入知识库以外的信息。
- 如果没有附带知识库内容，你可以用自己的知识回答，但要保持谨慎，提醒用户这是 AI 的补充内容。
- 回答风格：引导式、启发式，帮助用户自己思考和建立体系，不要直接罗列所有答案。
- 语气亲切，适合备考场景，偶尔可以用例子帮助理解。
- 不要在回答中使用固定的结构化模板，根据问题灵活组织语言。
- 如果问题涉及计算，请一步一步展示推导过程。`

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { question, kbContext, model = 'deepseek-chat', history = [] } = body

  // Build user message — inject knowledge base context if available
  let userContent = question
  if (kbContext) {
    userContent = `【知识库内容】\n${kbContext}\n\n【用户问题】\n${question}`
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.filter(m => m.role === 'user' || m.role === 'assistant').slice(-6),
    { role: 'user', content: userContent },
  ]

  try {
    const upstream = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.6,
        max_tokens: 1500,
      }),
    })

    if (!upstream.ok) {
      const err = await upstream.text()
      return new Response(JSON.stringify({ error: `DeepSeek error: ${err}` }), { status: 502 })
    }

    const data = await upstream.json()
    const answer = data.choices?.[0]?.message?.content ?? '抱歉，没有收到有效回答。'

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
