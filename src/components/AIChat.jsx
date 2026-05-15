import { useState, useRef, useEffect } from 'react'
import { Send, Bot, BookOpen, Loader2, Trash2 } from 'lucide-react'
import { findRelevantContext } from '../utils/knowledgeSearch'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

// ─── 常量 ────────────────────────────────────────────────
const STORAGE_KEY = 'kc431_chat_history'
const STYLE_KEY   = 'kc431_chat_style'
const MODEL_KEY   = 'kc431_chat_model'

const WELCOME_MSG = {
  role: 'assistant',
  content: '你好！我是你的431备考助手 👋\n\n你可以问我知识点相关的问题，我会优先从你的知识库里找答案。如果你的知识库里没有，我会额外补充并说明。',
  sourceLabel: null,
}

const STYLES = [
  {
    key: 'default',
    label: '默认',
    title: '均衡回答，模型自由发挥',
  },
  {
    key: 'socratic',
    label: '引导式',
    title: '通过提问引导你主动推理，而不是直接给答案',
  },
  {
    key: 'concise',
    label: '精炼',
    title: '先给结论再解释，简洁但不丢关键步骤',
  },
]

const MODELS = [
  { key: 'deepseek-v4-flash', label: 'Flash', title: 'V4 Flash · 更快，日常问答首选' },
  { key: 'deepseek-v4-pro',   label: 'Pro',   title: 'V4 Pro · 更强，复杂推导/论述首选' },
]

// ─── 工具函数 ─────────────────────────────────────────────
function loadMessages() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return [WELCOME_MSG]
}

function saveMessages(msgs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50)))
  } catch {}
}

function loadStyle() {
  try { return localStorage.getItem(STYLE_KEY) || 'default' } catch { return 'default' }
}

function saveStyle(s) {
  try { localStorage.setItem(STYLE_KEY, s) } catch {}
}

function loadModel() {
  try { return localStorage.getItem(MODEL_KEY) || 'deepseek-v4-flash' } catch { return 'deepseek-v4-flash' }
}

function saveModel(m) {
  try { localStorage.setItem(MODEL_KEY, m) } catch {}
}

/**
 * 把 DeepSeek 可能输出的 \[...\] 和 \(...\) 统一转成
 * remark-math 能识别的 $$...$$ 和 $...$
 */
function normalizeMath(text) {
  if (!text) return text
  // \[...\] → $$...$$（块级公式）
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `$$${m}$$`)
  // \(...\) → $...$（行内公式）
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m}$`)
  return text
}

// ─── 子组件 ───────────────────────────────────────────────
function ModelSwitcher({ model, onChange }) {
  return (
    <div className="flex rounded-lg bg-slate-100 p-0.5 gap-0.5">
      {MODELS.map(m => (
        <button
          key={m.key}
          title={m.title}
          onClick={() => onChange(m.key)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
            model === m.key
              ? 'bg-white text-violet-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}

function StyleSwitcher({ style, onChange }) {
  return (
    <div className="flex rounded-lg bg-slate-100 p-0.5 gap-0.5">
      {STYLES.map(s => (
        <button
          key={s.key}
          title={s.title}
          onClick={() => onChange(s.key)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
            style === s.key
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot size={14} className="text-indigo-600" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? '' : ''}`}>
        {msg.sourceLabel && (
          <div className={`flex items-center gap-1 text-xs mb-1 ${
            msg.sourceLabel === 'kb' ? 'text-indigo-500' : 'text-amber-500'
          }`}>
            {msg.sourceLabel === 'kb'
              ? <><BookOpen size={11} /> 基于你的知识库</>
              : <><Bot size={11} /> AI 补充（非知识库内容）</>
            }
          </div>
        )}
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
        }`}>
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div className="prose-custom text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
              >{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {msg.usedNotes?.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {msg.usedNotes.map(n => (
              <span key={n.id} className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                {n.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 主组件 ───────────────────────────────────────────────
export default function AIChat({ notes, inline }) {
  const [messages, setMessages] = useState(loadMessages)
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [style, setStyle]       = useState(loadStyle)
  const [model, setModel]       = useState(loadModel)

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    saveMessages(messages)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function updateStyle(s) {
    setStyle(s)
    saveStyle(s)
  }

  function updateModel(m) {
    setModel(m)
    saveModel(m)
  }

  function clearHistory() {
    const fresh = [WELCOME_MSG]
    setMessages(fresh)
    saveMessages(fresh)
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const relevant    = findRelevantContext(notes, text, 3)
      const hasKbContext = relevant.length > 0

      const kbContext = hasKbContext
        ? relevant.map(n => `【${n.title}】\n${n.content}`).join('\n\n---\n\n')
        : null

      const res = await fetch('/.netlify/functions/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          kbContext,
          model,
          style,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }

      // ── 流式读取 SSE ──────────────────────────────────────
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer  = ''
      let fullContent = ''

      // 先插入一条空的 assistant 消息，后续逐字更新
      const baseMsg = {
        role: 'assistant',
        content: '',
        sourceLabel: hasKbContext ? 'kb' : 'ai',
        usedNotes: hasKbContext ? relevant : [],
      }
      setMessages(prev => [...prev, baseMsg])

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // 保留不完整的最后一行

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') break outer
          try {
            const parsed = JSON.parse(payload)
            const delta = parsed.choices?.[0]?.delta?.content || ''
            if (delta) {
              fullContent += delta
              setMessages(prev => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, content: normalizeMath(fullContent) }
                }
                return updated
              })
            }
          } catch { /* 忽略非 JSON 行 */ }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `抱歉，请求出错了：${err.message}。请检查网络或 API 配置。`,
        sourceLabel: null,
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className={`flex flex-col ${inline ? 'flex-1 h-full' : 'h-full'}`}>

      {/* 桌面/平板 header（非 inline 模式） */}
      {!inline && (
        <div className="px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
          <Bot size={16} className="text-indigo-600 flex-shrink-0" />
          <span className="font-semibold text-slate-700 text-sm">AI 助手</span>
          <div className="ml-auto flex items-center gap-2">
            <ModelSwitcher model={model} onChange={updateModel} />
            <StyleSwitcher style={style} onChange={updateStyle} />
            <button
              onClick={clearHistory}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="清空对话记录"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Loader2 size={14} className="text-indigo-600 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5">
              <div className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 输入区（含移动端风格切换 + 清空按钮） */}
      <div className="px-3 py-3 border-t border-slate-200 bg-white">
        {/* 移动端工具栏（inline 模式才显示） */}
        {inline && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <ModelSwitcher model={model} onChange={updateModel} />
              <StyleSwitcher style={style} onChange={updateStyle} />
            </div>
            <button
              onClick={clearHistory}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="清空对话记录"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="问个知识点..."
            rows={1}
            className="flex-1 resize-none text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-300 focus:bg-white transition-all max-h-32 overflow-y-auto"
            style={{ minHeight: '38px', fontSize: '16px' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-center">
          Enter 发送 · Shift+Enter 换行
        </p>
      </div>
    </div>
  )
}
