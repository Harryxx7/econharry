import { useState, useEffect } from 'react'
import { X, BookOpen, RefreshCw } from 'lucide-react'

const CACHE_PREFIX = 'review_sum_'

function getCacheKey(filePath) {
  return CACHE_PREFIX + encodeURIComponent(filePath)
}

export default function SummaryModal({ note, onClose, onViewFull }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!note) return
    const cached = localStorage.getItem(getCacheKey(note.path))
    if (cached) { setSummary(cached); return }
    generate(false)
  }, [note?.path])

  async function generate(forceRefresh = false) {
    if (!note) return
    if (!forceRefresh) {
      const cached = localStorage.getItem(getCacheKey(note.path))
      if (cached) { setSummary(cached); return }
    }
    setLoading(true)
    setError(false)
    setSummary(null)

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'review', content: note.content }),
      })
      if (!res.ok) throw new Error('API error')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const data = line.slice(5).trim()
          if (data === '[DONE]') continue
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content
            if (delta) { fullText += delta; setSummary(fullText) }
          } catch { /* skip malformed chunks */ }
        }
      }
      if (fullText) localStorage.setItem(getCacheKey(note.path), fullText)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-t-2xl shadow-2xl flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#333] flex-shrink-0">
          <span className="font-semibold text-slate-800 dark:text-slate-100 truncate pr-4">{note.title}</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => generate(true)}
              title="重新生成"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {loading && !summary && (
            <div className="flex items-center gap-2 text-slate-400 py-4">
              <RefreshCw size={15} className="animate-spin" />
              <span>正在提炼考点...</span>
            </div>
          )}
          {error && (
            <p className="text-red-500">生成失败，请直接查看完整内容。</p>
          )}
          {summary && (
            <div className="whitespace-pre-wrap">{summary}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-slate-200 dark:border-[#333] flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#333] text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252525] transition-colors"
          >
            关闭
          </button>
          <button
            onClick={() => onViewFull(note)}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <BookOpen size={15} />
            显示完整内容
          </button>
        </div>
      </div>
    </div>
  )
}
