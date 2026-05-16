const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const DEFAULT_MODEL = 'deepseek-v4-flash'

const MODEL_CONFIG = {
  'deepseek-v4-flash': {
    model: 'deepseek-v4-flash',
    temperature: 0.6,
    max_tokens: 2000,
    thinking: { type: 'disabled' },
  },
  'deepseek-v4-pro': {
    model: 'deepseek-v4-pro',
    temperature: 0.5,
    max_tokens: 3000,
  },
}

const BASE_PROMPT = `你是一个辅助备考复旦大学431金融专硕的学习助手。

你的工作方式：
- 如果用户的问题附带了"【知识库内容】"，你必须严格基于这些内容来回答，不得引入知识库以外的信息。
- 如果没有附带知识库内容，你可以用自己的知识回答，但要保持谨慎，提醒用户这是 AI 的补充内容。
- 语气亲切，适合备考场景，偶尔可以用例子帮助理解。
- 不要在回答中使用固定的结构化模板，根据问题灵活组织语言。
- 如果问题涉及计算，请一步一步展示推导过程。
- 数学公式必须使用标准 LaTeX 格式：行内公式用 $公式$，独立块级公式用 $$公式$$。不要使用 \\(...\\) 或 \\[...\\] 这两种写法。`

const STYLE_HINTS = {
  default: '',

  socratic:
    '\n\n【当前模式：引导式】\n' +
    '不要直接给出答案。先用 1-2 个问题探一下用户的已有理解或思路，' +
    '再根据他的回答有针对性地引导，帮他自己推导出结论。\n' +
    '例如："你觉得这里的关键变量是什么？" 或 "如果利率上升，你预期价格会怎么变？"\n' +
    '如果用户明确说"直接告诉我答案"，再给完整解答。',

  concise:
    '\n\n【当前模式：精炼】\n' +
    '严格按以下结构回答，不得添加多余内容：\n' +
    '1. 第一句：直接给出核心结论或公式\n' +
    '2. 若需要：用最短的篇幅解释关键步骤或易混淆点\n' +
    '3. 完整停止，不写总结句\n' +
    '禁止出现："首先让我们了解……""这是个好问题""总的来说""综上所述"等铺垫和收尾套话。\n' +
    '多个要点优先用列表，不用长段落。目标是用最少的字说清楚。',
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

async function readUpstreamError(upstream) {
  const text = await upstream.text().catch(() => '')
  if (!text) return `DeepSeek request failed with HTTP ${upstream.status}`

  try {
    const parsed = JSON.parse(text)
    return parsed.error?.message || parsed.error || text
  } catch {
    return text
  }
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: CORS_HEADERS })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return jsonResponse({ error: 'API key not configured' }, 500)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }

  const { question, kbContext, model = DEFAULT_MODEL, history = [], style = 'default' } = body
  const modelConfig = MODEL_CONFIG[model] ?? MODEL_CONFIG[DEFAULT_MODEL]

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
      body: JSON.stringify({
        model: modelConfig.model,
        messages,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.max_tokens,
        stream: true,
        thinking: modelConfig.thinking,
      }),
    })

    if (!upstream.ok) {
      const err = await readUpstreamError(upstream)
      return jsonResponse({ error: `DeepSeek [${upstream.status}] ${err}` }, upstream.status)
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    return jsonResponse({ error: err.message }, 500)
  }
}

export const config = { path: '/api/ai-chat' }
