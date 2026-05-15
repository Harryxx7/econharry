const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

// 基础 prompt：不含风格约束，风格由前端动态传入
const BASE_PROMPT = `你是一个辅助备考复旦大学431金融专硕的学习助手。

你的工作方式：
- 如果用户的问题附带了"【知识库内容】"，你必须严格基于这些内容来回答，不得引入知识库以外的信息。
- 如果没有附带知识库内容，你可以用自己的知识回答，但要保持谨慎，提醒用户这是 AI 的补充内容。
- 语气亲切，适合备考场景，偶尔可以用例子帮助理解。
- 不要在回答中使用固定的结构化模板，根据问题灵活组织语言。
- 如果问题涉及计算，请一步一步展示推导过程。
- 数学公式必须使用标准 LaTeX 格式：行内公式用 $公式$，独立块级公式用 $$公式$$。不要使用 \(...\) 或 \[...\] 这两种写法。`

// 风格偏好：软性提示，用"倾向于"而非"必须"，让模型保留判断空间
const STYLE_HINTS = {
  default: '', // 不附加任何偏好，模型自由发挥

  socratic:
    '\n\n【回答偏好：引导式】倾向于通过提问引导用户自己推理，而不是直接给出完整答案。' +
    '可以先了解用户的已有理解，再用追问或提示引导他一步步得出结论。' +
    '但如果问题非常简单或用户明确要求直接答案，不必强行绕弯。',

  concise:
    '\n\n【回答偏好：精炼式】倾向于先给出核心结论，再配以必要的推导或解释。' +
    '避免冗长铺垫和重复，语言简洁但不过度压缩——关键推导步骤和易混淆的区分点要保留。',
}

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { question, kbContext, model = 'deepseek-chat', history = [], style = 'default' } = body

  // 拼接最终 system prompt = 基础 + 风格偏好（未知 style 值降级为 default）
  const styleHint = STYLE_HINTS[style] ?? ''
  const systemPrompt = BASE_PROMPT + styleHint

  let userContent = question
  if (kbContext) {
    userContent = `【知识库内容】\n${kbContext}\n\n【用户问题】\n${question}`
  }

  const messages = [
    { role: 'system', content: systemPrompt },
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
      body: JSON.stringify({ model, messages, temperature: 0.6, max_tokens: 1500 }),
    })

    if (!upstream.ok) {
      const err = await upstream.text()
      return { statusCode: 502, headers, body: JSON.stringify({ error: `DeepSeek error: ${err}` }) }
    }

    const data = await upstream.json()
    const answer = data.choices?.[0]?.message?.content ?? '抱歉，没有收到有效回答。'

    return { statusCode: 200, headers, body: JSON.stringify({ answer }) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}
