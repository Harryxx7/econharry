import { useState, useRef, useEffect } from 'react'
import { Send, Bot, BookOpen, Loader2, Trash2 } from 'lucide-react'

const STORAGE_KEY = 'kc431_chat_history'
const WELCOME_MSG = {
  role: 'assistant',
  content: '你好！我是你的431备考助手 👋\n\n你可以问我知识点相关的问题，我会优先从你的知识库里找答案。如果你的知识库里没有，我会额外补充并说明。',
  sourceLabel: null,
}

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
import { findRelevantContext } from '../utils/knowledgeSearch'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const COMPLEX_KEYWORDS = ['推导', '计算', '证明', '论述', '推算', '分析', '比较', '评价', '为什么', '如何理解']

function isComplex(text) {
  return COMPLEX_KEYWORDS.some(k => text.includes(k))
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
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
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

export default function AIChat({ notes, inline }) {
  const [messages, setMessages] = useState(loadMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    saveMessages(messages)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      const relevant = findRelevantContext(notes, text, 3)
      const hasKbContext = relevant.length > 0

      const kbContext = hasKbContext
        ? relevant.map(n => `【${n.title}】\n${n.content}`).join('\n\n---\n\n')
        : null

      const model = isComplex(text) ? 'deepseek-reasoner' : 'deepseek-chat'

      const res = await fetch('/.netlify/functions/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          kbContext,
          model,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sourceLabel: hasKbContext ? 'kb' : 'ai',
        usedNotes: hasKbContext ? relevant : [],
      }])
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
      {!inline && (
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <Bot size={16} className="text-indigo-600" />
          <span className="font-semibold text-slate-700 text-sm">AI 助手</span>
          <button
            onClick={clearHistory}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="清空对话"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Messages */}
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

      {/* Input */}
      <div className="px-3 py-3 border-t border-slate-200 bg-white">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="问个知识点..."
            rows={1}
            className="flex-1 resize-none text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-300 focus:bg-white transition-all max-h-32 overflow-y-auto"
            style={{ minHeight: '38px' }}
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
